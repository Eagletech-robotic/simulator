import { AiInstance, topInit, topStep } from 'src/utils/wasm-connector'
import { Canvas } from './Canvas'
import {
    controlledRobotWidth,
    controlledRobotHeight,
    controlledRobotWheelsGap,
    controlledRobotWheelDiameter,
    encoderImpulsesPerWheelTurn,
    controlledRobotMaxSpeed,
    stepDurationMs,
} from './constants'
import { GenericRobot } from './GenericRobot'
import { ControlledRobotStep } from './RobotStep'

export class ControlledRobot extends GenericRobot {
    readonly type = 'controlled'
    aiInstance: AiInstance | undefined

    readonly width = controlledRobotWidth
    readonly height = controlledRobotHeight

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
        const bigCircleRadius = controlledRobotWheelsGap / (1 - smallestDistance / largestDistance)

        const rotationAngle = (largestDistance / bigCircleRadius) * signMultiplier // definition of the radian
        const middleCircleRadius = bigCircleRadius - controlledRobotWheelsGap / 2 // the circle described by the middle of the robot

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
        for (let i = 0; i < stepNb; i += 50) {
            const color = canvas.getDrawingColor(this.color)
            const opacity = Math.max(1 - (stepNb - i) / 6500, 0)
            canvas.drawCircle(this.steps[i].x, this.steps[i].y, 3, color, opacity)
        }

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
            output.vitesse1_ratio * controlledRobotMaxSpeed * (stepDurationMs / 1000),
            output.vitesse2_ratio * controlledRobotMaxSpeed * (stepDurationMs / 1000)
        )
    }
}
