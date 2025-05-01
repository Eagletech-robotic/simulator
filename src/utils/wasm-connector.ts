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
}

export const topInit = async (): Promise<AiInstance> => {
    const logs: Array<Log> = []
    let wasmInstance: AiInstance['wasmInstance']

    const importObject = {
        wasi_snapshot_preview1: {
            proc_exit: (code: number) => console.log(`Exit code: ${code}`),
            fd_write: (fd: number, iovs: number, iovs_len: number, nwritten: number) => {
                try {
                    const memory = wasmInstance.exports.memory
                    const memoryView = new DataView(memory.buffer)

                    let output = ''
                    for (let i = 0; i < iovs_len; i++) {
                        const iovPtr = iovs + i * 8
                        const ptr = memoryView.getUint32(iovPtr, true)
                        const len = memoryView.getUint32(iovPtr + 4, true)
                        const bytes = new Uint8Array(memory.buffer, ptr, len)
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
        },
    }

    const obj = await WebAssembly.instantiateStreaming(
        fetch('simulator-connector.wasm'),
        importObject,
    )
    wasmInstance = obj.instance as AiInstance['wasmInstance']
    wasmInstance.exports.exported_top_init()
    return { wasmInstance, logs }
}

export interface StepInput {
    is_jack_gone: number
    tof_m: number
    delta_yaw_deg: number
    delta_encoder_left: number
    delta_encoder_right: number
    imu_yaw_deg: number
    imu_accel_x_mss: number
    imu_accel_y_mss: number
    imu_accel_z_mss: number
    blue_button: number
    clock_ms: number
}

export interface StepOutput {
    motor_left_ratio: number
    motor_right_ratio: number
    servo_pelle_ratio: number
    servo_extra_ratio: number
    led_ratio: number
}

export const topStep = (
    aiInstance: AiInstance,
    input: StepInput,
    bluetooth: Array<number>,
): { output: StepOutput; logs: Array<Log> } => {
    const { wasmInstance, logs } = aiInstance
    const inputPtr = wasmInstance.exports.create_input()
    const outputPtr = wasmInstance.exports.create_output()
    const bluetoothPtr = wasmInstance.exports.create_bluetooth()

    if (!inputPtr || !outputPtr) {
        throw new Error('WebAssembly memory allocation failed: inputPtr or outputPtr is null')
    }

    const wasmMemory = wasmInstance.exports.memory

    const dataView = new DataView(wasmMemory.buffer, inputPtr)
    dataView.setInt32(0, input.is_jack_gone, true)
    dataView.setFloat32(4, input.tof_m, true)
    dataView.setFloat32(8, input.delta_yaw_deg, true)
    dataView.setInt32(12, input.delta_encoder_left, true)
    dataView.setInt32(16, input.delta_encoder_right, true)
    dataView.setFloat32(20, input.imu_yaw_deg, true)
    dataView.setFloat32(24, input.imu_accel_x_mss, true)
    dataView.setFloat32(28, input.imu_accel_y_mss, true)
    dataView.setFloat32(32, input.imu_accel_z_mss, true)
    dataView.setInt32(36, input.blue_button, true)
    dataView.setInt32(40, 0, true)

    const bluetoothView = new Uint8Array(wasmMemory.buffer, bluetoothPtr, bluetooth.length)
    bluetoothView.set(bluetooth)

    logs.length = 0
    wasmInstance.exports.exported_top_step(inputPtr, outputPtr, bluetoothPtr, bluetooth.length)

    const floatViewOutput = new Float32Array(wasmMemory.buffer, outputPtr, 5)
    return {
        output: {
            motor_left_ratio: floatViewOutput[0],
            motor_right_ratio: floatViewOutput[1],
            servo_pelle_ratio: floatViewOutput[2],
            servo_extra_ratio: floatViewOutput[3],
            led_ratio: floatViewOutput[4],
        },
        logs: [...logs],
    }
}
