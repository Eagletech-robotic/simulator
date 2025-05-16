import { Log } from 'src/models/robot/RobotStep'

const textDecoder = new TextDecoder() // For decoding UTF-8 strings

export type AiInstance = {
    wasmInstance: WebAssembly.Instance & {
        exports: {
            memory: WebAssembly.Memory
            exported_top_init: () => void
            create_input: () => number
            create_output: () => number
            create_bluetooth: () => number
            exported_top_step: (inputPtr: number, outputPtr: number, bluetoothPtr: number, bluetoothBlockSize: number) => void
        }
    }
    logs: Array<Log>
    inputPtr: number
    outputPtr: number
    bluetoothPtr: number
}

export const topInit = async (): Promise<AiInstance> => {
    const logs: Array<Log> = []
    let wasmInstance: AiInstance['wasmInstance']
    let wasmMemory: WebAssembly.Memory | null = null

    const importObject = {
        wasi_snapshot_preview1: {
            proc_exit: (code: number) => console.log(`Exit code: ${code}`),
            fd_write: (fd: number, iovs: number, iovs_len: number, nwritten: number) => {
                try {
                    if (!wasmMemory) return
                    const memoryView = new DataView(wasmMemory.buffer)

                    let output = ''
                    for (let i = 0; i < iovs_len; i++) {
                        const iovPtr = iovs + i * 8
                        const ptr = memoryView.getUint32(iovPtr, true)
                        const len = memoryView.getUint32(iovPtr + 4, true)
                        const bytes = new Uint8Array(wasmMemory.buffer, ptr, len)
                        output += textDecoder.decode(bytes)
                    }

                    logs.push({ log: output, level: fd === 1 ? 'info' : 'error' })

                    // Set nwritten to the total bytes written to prevent infinite loop
                    if (nwritten) {
                        memoryView.setUint32(nwritten, output.length, true)
                    }
                } catch (e) {
                    console.error(e)
                }
            },
            fd_close: (fd: number) => console.log(`Close file descriptor: ${fd}`),
            fd_seek: (fd: number) => console.log(`Seek file descriptor: ${fd}`),
            clock_time_get: (clk_id: number, precision: bigint, timePtr: number) => {
                if (!wasmMemory) return
                const memoryView = new DataView(wasmMemory.buffer)
                const nowNs = BigInt(Math.round(performance.now() * 1_000_000))
                memoryView.setBigUint64(timePtr, nowNs, true)
            },

        },
    }

    const obj = await WebAssembly.instantiateStreaming(
        fetch('simulator-connector.wasm'),
        importObject,
    )
    wasmInstance = obj.instance as AiInstance['wasmInstance']
    wasmMemory = wasmInstance.exports.memory
    wasmInstance.exports.exported_top_init()

    // Allocate buffers for input, output, and bluetooth
    const inputPtr = wasmInstance.exports.create_input()
    const outputPtr = wasmInstance.exports.create_output()
    const bluetoothPtr = wasmInstance.exports.create_bluetooth()
    if (!inputPtr || !outputPtr) {
        throw new Error('WebAssembly memory allocation failed: inputPtr or outputPtr is null')
    }

    return { wasmInstance, logs, inputPtr, outputPtr, bluetoothPtr }
}

export interface StepInput {
    jack_removed: number
    tof_m: number
    delta_yaw: number
    delta_encoder_left: number
    delta_encoder_right: number
    imu_yaw: number
    imu_accel_x_mss: number
    imu_accel_y_mss: number
    imu_accel_z_mss: number
    blue_button: number
    clock_ms: number
}

export const potentialFieldWidth = 75
export const potentialFieldHeight = 50

export interface StepOutput {
    motor_left_ratio: number
    motor_right_ratio: number
    servo_pelle_ratio: number
    servo_extra_ratio: number
    led_ratio: number
    potential_field: number[][] | null // null means no change from previous step
}

export const topStep = (
    aiInstance: AiInstance,
    input: StepInput,
    bluetooth: Array<number>,
    prevPotentialField: number[][] | null,
): { output: StepOutput; logs: Array<Log> } => {
    const { wasmInstance, logs, inputPtr, outputPtr, bluetoothPtr } = aiInstance
    const wasmMemory = wasmInstance.exports.memory

    const dataView = new DataView(wasmMemory.buffer, inputPtr)
    dataView.setInt32(0, input.jack_removed, true)
    dataView.setFloat32(4, input.tof_m, true)
    dataView.setFloat32(8, input.delta_yaw, true)
    dataView.setInt32(12, input.delta_encoder_left, true)
    dataView.setInt32(16, input.delta_encoder_right, true)
    dataView.setFloat32(20, input.imu_yaw, true)
    dataView.setFloat32(24, input.imu_accel_x_mss, true)
    dataView.setFloat32(28, input.imu_accel_y_mss, true)
    dataView.setFloat32(32, input.imu_accel_z_mss, true)
    dataView.setInt32(36, input.blue_button, true)
    dataView.setInt32(40, input.clock_ms, true)

    const bluetoothView = new Uint8Array(wasmMemory.buffer, bluetoothPtr, bluetooth.length)
    bluetoothView.set(bluetooth)

    logs.length = 0 // Empty logs
    wasmInstance.exports.exported_top_step(inputPtr, outputPtr, bluetoothPtr, bluetooth.length)

    const HEADER_FLOATS = 5
    const flat = new Float32Array(wasmMemory.buffer, outputPtr, HEADER_FLOATS + potentialFieldWidth * potentialFieldHeight)

    // Check if the potential field has changed
    let potentialFieldChanged = true
    if (prevPotentialField) {
        potentialFieldChanged = false
        for (let x = 0; x < potentialFieldWidth && !potentialFieldChanged; ++x) {
            const row = prevPotentialField[x]
            const base = HEADER_FLOATS + x * potentialFieldHeight
            for (let y = 0; y < potentialFieldHeight; ++y) {
                if (flat[base + y] !== row[y]) {
                    potentialFieldChanged = true
                    break
                }
            }
        }
    }

    // Fill the potential field if it's different (this is costly because of the memory allocations)
    let potential_field: StepOutput["potential_field"] = null
    if (potentialFieldChanged) {
        potential_field = []
        for (let x = 0; x < potentialFieldWidth; ++x) {
            const start = HEADER_FLOATS + x * potentialFieldHeight
            potential_field.push(Array.from(flat.subarray(start, start + potentialFieldHeight)))
        }
    }

    return {
        output: {
            motor_left_ratio: flat[0],
            motor_right_ratio: flat[1],
            servo_pelle_ratio: flat[2],
            servo_extra_ratio: flat[3],
            led_ratio: flat[4],
            potential_field,
        },
        logs: [...logs],
    }
}
