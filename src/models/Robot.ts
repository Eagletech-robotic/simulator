import { AiInstance, topInit, topStep } from 'src/utils/wasm-connector'
import { Canvas } from './Canvas'
import {
    controlledRobotWheelDiameter,
    encoderImpulsesPerWheelTurn,
    stepDurationMs,
} from './constants'

interface GenericRobotStep {
    x: number // millimeters, 0 is left
    y: number // millimeters, 0 is top
    orientation: number // radians, 0 is top, positive is clockwise
}

interface ControlledRobotStep extends GenericRobotStep {
    leftWheelDistance: number
    rightWheelDistance: number
}

export abstract class GenericRobot {
    abstract readonly type: 'controlled' | 'sequential'
    abstract readonly width: number
    abstract readonly height: number

    abstract draw(canvas: Canvas, stepNb: number): void
    abstract nextStep(): void
    abstract get lastStep(): GenericRobotStep
    abstract reset(): Promise<void> | void

    readonly color: 'blue' | 'yellow'
    readonly id: number

    abstract steps: Array<GenericRobotStep>

    constructor(color: 'blue' | 'yellow') {
        this.color = color
        this.id = Math.floor(Math.random() * 1000000)
    }

    moveForward(distance: number): GenericRobotStep {
        const step = this.lastStep

        const unitCircleOrientation = -step.orientation + Math.PI / 2
        return {
            x: step.x + Math.cos(unitCircleOrientation) * distance,
            y: step.y - Math.sin(unitCircleOrientation) * distance,
            orientation: step.orientation,
        }
    }

    setOrientationInDegrees(degrees: number) {
        this.lastStep.orientation = (degrees * Math.PI) / 180
    }

    orientationInDegrees(stepNb = this.steps.length - 1): number {
        return (this.steps[stepNb].orientation * 180) / Math.PI
    }

    isControlled(): this is ControlledRobot {
        return this.type === 'controlled'
    }
}

export class ControlledRobot extends GenericRobot {
    readonly type = 'controlled'
    aiInstance: AiInstance | undefined

    readonly width = 350 // millimeters
    readonly height = 350 // millimeters
    readonly wheelsGap = 320 // millimeters

    steps: Array<ControlledRobotStep>

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        super(color)
        this.steps = [{ x, y, orientation, leftWheelDistance: 0, rightWheelDistance: 0 }]
    }

    async reset() {
        this.steps = [this.steps[0]]
        await this.resetAiInstance()
    }

    private async resetAiInstance() {
        this.aiInstance = await topInit()
    }

    get lastStep(): ControlledRobotStep {
        return this.steps[this.steps.length - 1]
    }

    moveFromWheelRotationDistances(leftWheelDistance: number, rightWheelDistance: number) {
        const step = this.lastStep

        // If both wheels have moved the same distance, the robot has moved forward
        if (leftWheelDistance === rightWheelDistance) {
            this.steps.push({
                ...this.moveForward(leftWheelDistance),
                leftWheelDistance,
                rightWheelDistance,
            })
            return
        }

        const signMultiplier = Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance) ? 1 : -1
        const smallestDistance =
            Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance)
                ? rightWheelDistance
                : leftWheelDistance
        const largestDistance =
            Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance)
                ? leftWheelDistance
                : rightWheelDistance
        const bigCircleRadius = this.wheelsGap / (1 - smallestDistance / largestDistance)

        const rotationAngle = (largestDistance / bigCircleRadius) * signMultiplier // definition of the radian
        const middleCircleRadius = bigCircleRadius - this.wheelsGap / 2 // the circle described by the middle of the robot

        // Update robot position and orientation
        const wheelAxisAngle = step.orientation - (Math.PI / 2) * signMultiplier

        this.steps.push({
            x:
                step.x +
                middleCircleRadius *
                    (Math.sin(wheelAxisAngle + rotationAngle) - Math.sin(wheelAxisAngle)),
            y:
                step.y -
                middleCircleRadius *
                    (Math.cos(wheelAxisAngle + rotationAngle) - Math.cos(wheelAxisAngle)),
            orientation: step.orientation + rotationAngle,
            leftWheelDistance: step.leftWheelDistance + leftWheelDistance,
            rightWheelDistance: step.rightWheelDistance + rightWheelDistance,
        })
    }

    draw(canvas: Canvas, stepNb: number) {
        const step = this.steps[stepNb]
        canvas.drawCircle(step.x, step.y, this.width / 2, canvas.getDrawingColor(this.color))
        canvas.drawOrientationLine(step.x, step.y, step.orientation, this.width / 2)
    }

    nextStep() {
        const step = this.lastStep

        const wheelCircumference = Math.PI * controlledRobotWheelDiameter // millimeters
        const impulseDistance = wheelCircumference / encoderImpulsesPerWheelTurn // millimeters
        const output = topStep(this.aiInstance!, {
            is_jack_gone: 1,
            last_wifi_data: [],
            encoder1: step.leftWheelDistance / impulseDistance,
            encoder2: step.rightWheelDistance / impulseDistance,
            tof: 0,
            gyro: [0, 0, 0],
            accelero: [0, 0, 0],
            compass: [0, 0, 0],
        })

        this.moveFromWheelRotationDistances(
            (output.vitesse1_ratio * 300 * stepDurationMs) / 1000, // Max is 1 which is 30 cm/s
            (output.vitesse2_ratio * 300 * stepDurationMs) / 1000
        )
    }
}

export class SequentialRobot extends GenericRobot {
    readonly type = 'sequential'

    readonly width = 150 // millimeters
    readonly height = 150 // millimeters

    steps: Array<GenericRobotStep>

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        super(color)
        this.steps = [{ x, y, orientation }]
    }

    reset() {
        this.steps = [this.steps[0]]
    }

    draw(canvas: Canvas, stepNb: number) {
        const step = this.steps[stepNb]
        canvas.drawRectangle(
            step.x,
            step.y,
            this.width,
            this.height,
            step.orientation,
            canvas.getDrawingColor(this.color)
        )
        canvas.drawOrientationLine(step.x, step.y, step.orientation, this.width / 2)
    }

    get lastStep(): GenericRobotStep {
        return this.steps[this.steps.length - 1]
    }

    nextStep() {
        this.steps.push(this.moveForward(0.05))
    }
}
