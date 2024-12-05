const textDecoder = new TextDecoder() // For decoding UTF-8 strings

export type AiInstance = WebAssembly.Instance & {
    exports: {
        memory: WebAssembly.Memory
        exported_top_init: () => void
        create_input: () => number
        create_output: () => number
        exported_top_step: (input: number, output: number) => void
    }
}

export const topInit = async (): Promise<AiInstance> => {
    let wasmInstance: AiInstance

    const importObject = {
        wasi_snapshot_preview1: {
            proc_exit: (code: number) => console.log(`Exit code: ${code}`),
            fd_write: (fd: number, iovs: number, iovs_len: number, nwritten: number) => {
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

                if (fd === 1) {
                    console.log(output)
                } else if (fd === 2) {
                    console.error(output)
                }

                // Set nwritten to the total bytes written to prevent infinite loop
                if (nwritten) {
                    memoryView.setUint32(nwritten, output.length, true)
                }
            },
        },
    }

    const obj = await WebAssembly.instantiateStreaming(
        fetch('simulator-connector.wasm'),
        importObject
    )
    wasmInstance = obj.instance as AiInstance
    wasmInstance.exports.exported_top_init()
    return wasmInstance
}

export interface StepInput {
    is_jack_gone: number
    last_wifi_data: number[]
    encoder1: number
    encoder2: number
    tof: number
    gyro: number[]
    accelero: number[]
    compass: number[]
}

export interface StepOutput {
    vitesse1_ratio: number
    vitesse2_ratio: number
    servo_pelle_ratio: number
}

export const topStep = (wasmInstance: AiInstance, input: StepInput): StepOutput => {
    const inputPtr = wasmInstance.exports.create_input()
    const outputPtr = wasmInstance.exports.create_output()

    const wasmMemory = wasmInstance.exports.memory

    const intView = new Int32Array(wasmMemory.buffer, inputPtr, 1 + 10 + 1 + 1) // `is_jack_gone`, `last_wifi_data[10]`, `encoder1`, `encoder2`
    const floatView = new Float32Array(wasmMemory.buffer, inputPtr + 4, 1 + 3 + 3 + 3) // `tof`, `gyro[3]`, `accelero[3]`, `compass[3]`
    intView[0] = input.is_jack_gone
    floatView[0] = input.tof
    floatView[1] = input.gyro[0]
    floatView[2] = input.gyro[1]
    floatView[3] = input.gyro[2]
    floatView[4] = input.accelero[0]
    floatView[5] = input.accelero[1]
    floatView[6] = input.accelero[2]
    floatView[7] = input.compass[0]
    floatView[8] = input.compass[1]
    floatView[9] = input.compass[2]
    for (let i = 0; i < 10; i++) {
        intView[1 + i] = input.last_wifi_data[i]
    }
    intView[11] = input.encoder1
    intView[12] = input.encoder2

    wasmInstance.exports.exported_top_step(inputPtr, outputPtr)

    const floatViewOutput = new Float32Array(wasmMemory.buffer, outputPtr, 3)
    return {
        vitesse1_ratio: floatViewOutput[0],
        vitesse2_ratio: floatViewOutput[1],
        servo_pelle_ratio: floatViewOutput[2],
    }
}
