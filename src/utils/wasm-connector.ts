import { Log } from 'src/models/RobotStep'

const textDecoder = new TextDecoder() // For decoding UTF-8 strings

export type AiInstance = {
    wasmInstance: WebAssembly.Instance & {
        exports: {
            memory: WebAssembly.Memory
            exported_top_init: () => void
            create_input: () => number
            create_output: () => number
            exported_top_step: (input: number, output: number) => void
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
        importObject
    )
    wasmInstance = obj.instance as AiInstance['wasmInstance']
    wasmInstance.exports.exported_top_init()
    return { wasmInstance, logs }
}

export interface StepInput {
    is_jack_gone: number
    tof_m: number
    x_mm: number
    y_mm: number
    orientation_degrees: number
    encoder1: number
    encoder2: number
    last_wifi_data: number[]
}

export interface StepOutput {
    vitesse1_ratio: number
    vitesse2_ratio: number
    servo_pelle_ratio: number
}

export const topStep = (
    aiInstance: AiInstance,
    input: StepInput
): { output: StepOutput; logs: Array<Log> } => {
    const { wasmInstance, logs } = aiInstance
    const inputPtr = wasmInstance.exports.create_input()
    const outputPtr = wasmInstance.exports.create_output()

    if (!inputPtr || !outputPtr) {
        throw new Error('WebAssembly memory allocation failed: inputPtr or outputPtr is null')
    }

    const wasmMemory = wasmInstance.exports.memory

    const dataView = new DataView(wasmMemory.buffer, inputPtr)

    dataView.setInt32(0, input.is_jack_gone, true)
    dataView.setFloat32(4, input.tof_m, true)
    dataView.setFloat32(8, input.x_mm, true)
    dataView.setFloat32(12, input.y_mm, true)
    dataView.setFloat32(16, input.orientation_degrees, true)
    dataView.setInt32(20, input.encoder1, true)
    dataView.setInt32(24, input.encoder2, true)
    for (let i = 0; i < 10; i++) {
        dataView.setInt32(28 + i * 4, input.last_wifi_data[i], true)
    }

    logs.length = 0
    wasmInstance.exports.exported_top_step(inputPtr, outputPtr)

    const floatViewOutput = new Float32Array(wasmMemory.buffer, outputPtr, 3)
    return {
        output: {
            vitesse1_ratio: floatViewOutput[0],
            vitesse2_ratio: floatViewOutput[1],
            servo_pelle_ratio: floatViewOutput[2],
        },
        logs: [...logs],
    }
}
