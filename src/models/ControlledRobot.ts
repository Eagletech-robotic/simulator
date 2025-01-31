import { AiInstance, StepInput, topInit, topStep } from 'src/utils/wasm-connector'
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

type Move = Pick<
    ControlledRobotStep,
    'x' | 'y' | 'orientation' | 'leftWheelDistance' | 'rightWheelDistance'
>

export class ControlledRobot extends GenericRobot {
    readonly type = 'controlled'
    aiInstance: AiInstance | undefined

    readonly width = controlledRobotWidth
    readonly height = controlledRobotHeight

    steps: Array<ControlledRobotStep>

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        super(color)
        this.steps = [
            {
                x,
                y,
                orientation,
                leftWheelDistance: 0,
                rightWheelDistance: 0,
                input: null,
                logs: null,
                output: null,
            },
        ]
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

    buildMove(leftWheelDistance: number, rightWheelDistance: number): Move {
        const step = this.lastStep

        // If both wheels have moved the same distance, the robot has moved forward
        if (leftWheelDistance === rightWheelDistance) {
            return {
                ...this.moveForward(leftWheelDistance),
                leftWheelDistance,
                rightWheelDistance,
            }
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

        return {
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
        }
    }

    draw(canvas: Canvas, stepNb: number, isSelected: boolean) {
        for (let i = 0; i < stepNb; i += 50) {
            const color = canvas.getDrawingColor(this.color)
            const opacity = Math.max(1 - (stepNb - i) / 6500, 0)
            canvas.drawDisc(this.steps[i].x, this.steps[i].y, 3, color, opacity)
        }

        const step = this.steps[stepNb]
        canvas.drawDisc(step.x, step.y, this.width / 2, canvas.getDrawingColor(this.color))
        canvas.drawOrientationLine(step.x, step.y, step.orientation, this.width / 2)

        if (isSelected) {
            canvas.drawCircle(step.x, step.y, this.width / 2, 'red')
        }
    }

    nextStep() {
        const step = this.lastStep

        const wheelCircumference = Math.PI * controlledRobotWheelDiameter // millimeters
        const impulseDistance = wheelCircumference / encoderImpulsesPerWheelTurn // millimeters
        const input: StepInput = {
            is_jack_gone: 1,
            tof_m: 1000,
            x_mm: step.x,
            y_mm: step.y,
            orientation_degrees: (step.orientation * 180) / Math.PI,
            encoder1: step.leftWheelDistance / impulseDistance,
            encoder2: step.rightWheelDistance / impulseDistance,
            last_wifi_data: [],
        }
        const { output, logs } = topStep(this.aiInstance!, input)

        const move = this.buildMove(
            output.vitesse1_ratio * controlledRobotMaxSpeed * (stepDurationMs / 1000),
            output.vitesse2_ratio * controlledRobotMaxSpeed * (stepDurationMs / 1000)
        )

        if (move.x < 0 || move.x > 3000 || move.y < 0 || move.y > 2000) {
            // console.error('Robot out of bounds', move)
            return
        }

        this.steps.push({ ...move, input, logs, output })

        if (this.steps.length % 1000 === 999) {
            const errors = this.steps
                .filter(
                    (step, i) =>
                        i > this.steps.length - 1000 &&
                        step.logs?.find((log) => log.level === 'error')
                )
                .map((step) => step.logs ?? [])
            const infos = this.steps
                .filter(
                    (step, i) =>
                        i > this.steps.length - 1000 &&
                        step.logs?.find((log) => log.level === 'info')
                )
                .map((step) => step.logs ?? [])

            console.log(`Logging for ${this.color} robot ${this.id}:`)
            console.info(infos)
            if (errors.length) console.error(errors)
        }
    }
}
