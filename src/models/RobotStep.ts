import { StepInput, StepOutput } from 'src/utils/wasm-connector'

export interface GenericRobotStep {
    x: number // millimeters, 0 is left
    y: number // millimeters, 0 is top
    orientation: number // radians, 0 is top, positive is clockwise
}

export type Log = { log: string; level: 'info' | 'error' }

export interface ControlledRobotStep extends GenericRobotStep {
    leftWheelDistance: number
    rightWheelDistance: number
    input: StepInput | null
    logs: Array<Log> | null
    output: StepOutput | null
}
