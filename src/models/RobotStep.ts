export interface GenericRobotStep {
    x: number // millimeters, 0 is left
    y: number // millimeters, 0 is top
    orientation: number // radians, 0 is top, positive is clockwise
}

export interface ControlledRobotStep extends GenericRobotStep {
    leftWheelDistance: number
    rightWheelDistance: number
}
