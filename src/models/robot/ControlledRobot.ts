import { AiInstance, StepInput, topInit, topStep } from 'src/utils/wasm-connector'
import { Canvas } from '../Canvas'
import {
    controlledRobotWidth,
    controlledRobotHeight,
    controlledRobotWheelbase,
    controlledRobotWheelDiameter,
    encoderImpulsesPerWheelTurn,
    controlledRobotMaxSpeed,
    stepDuration, fieldWidth, fieldHeight,
} from '../constants'
import { GenericRobot } from './GenericRobot'
import { ControlledRobotStep, Log } from './RobotStep'
import { radiansToDegrees } from '../../utils/maths'

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
        console.log(`Top init logs for ${this.color} robot ${this.id}:`, [...this.aiInstance.logs])
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
                leftWheelDistance: step.leftWheelDistance + leftWheelDistance,
                rightWheelDistance: step.leftWheelDistance + rightWheelDistance,
            }
        }

        const signMultiplier = Math.abs(rightWheelDistance) > Math.abs(leftWheelDistance) ? +1 : -1
        const smallestDistance =
            Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance)
                ? rightWheelDistance
                : leftWheelDistance
        const largestDistance =
            Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance)
                ? leftWheelDistance
                : rightWheelDistance
        const bigCircleRadius = controlledRobotWheelbase / (1 - smallestDistance / largestDistance)

        const rotationAngle = (largestDistance / bigCircleRadius) * signMultiplier // definition of the radian
        const middleCircleRadius = bigCircleRadius - controlledRobotWheelbase / 2 // the circle described by the middle of the robot

        // Update robot position and orientation
        const wheelAxisAngle = step.orientation - (Math.PI / 2) * signMultiplier

        return {
            x:
                step.x +
                middleCircleRadius * (Math.cos(wheelAxisAngle + rotationAngle) - Math.cos(wheelAxisAngle)),
            y:
                step.y +
                middleCircleRadius * (Math.sin(wheelAxisAngle + rotationAngle) - Math.sin(wheelAxisAngle)),
            orientation: step.orientation + rotationAngle,
            leftWheelDistance: step.leftWheelDistance + leftWheelDistance,
            rightWheelDistance: step.rightWheelDistance + rightWheelDistance,
        }
    }

    draw(canvas: Canvas, stepNb: number, isSelected: boolean) {
        for (let i = 0; i < stepNb; i += 50) {
            const color = canvas.getDrawingColor(this.color)
            const opacity = Math.max(1 - (stepNb - i) / 6500, 0)
            canvas.drawEllipse(this.steps[i].x, this.steps[i].y, 0.003, 0.003, 0, color, 'filled', opacity)
        }

        const step = this.steps[stepNb]
        canvas.drawEllipse(step.x, step.y, this.width / 2, this.height / 2, step.orientation, canvas.getDrawingColor(this.color), 'filled')
        canvas.drawOrientationLine(step.x, step.y, step.orientation, this.height / 2)

        if (isSelected) {
            canvas.drawEllipse(step.x, step.y, this.width / 2, this.height / 2, step.orientation, 'red', 'outlined')
        }
    }

    nextStep(eaglePacket: number[] | null) {
        const step = this.lastStep
        const previousStep = this.steps[this.steps.length - 2] ?? step

        const wheelCircumference = Math.PI * controlledRobotWheelDiameter // meters
        const impulseDistance = wheelCircumference / encoderImpulsesPerWheelTurn // meters

        // console.log('step.rightWheelDistance ', step.rightWheelDistance, 'previousStep.rightWheelDistance ', previousStep.rightWheelDistance, 'delta_encoder_left ', (step.rightWheelDistance - previousStep.rightWheelDistance) / impulseDistance)

        const input: StepInput = {
            jack_removed: 1,
            tof_m: 1,
            delta_yaw_deg: radiansToDegrees(step.orientation - previousStep.orientation),
            delta_encoder_left: (step.leftWheelDistance - previousStep.leftWheelDistance) / impulseDistance,
            delta_encoder_right: (step.rightWheelDistance - previousStep.rightWheelDistance) / impulseDistance,
            imu_yaw_deg: radiansToDegrees(step.orientation),
            imu_accel_x_mss: 0,
            imu_accel_y_mss: 0,
            imu_accel_z_mss: 0,
            blue_button: 0,
            clock_ms: (this.steps.length * stepDuration) * 1000,
        }
        const { output, logs } = topStep(this.aiInstance!, input, eaglePacket || [])

        const move = this.buildMove(
            output.motor_left_ratio * controlledRobotMaxSpeed * stepDuration,
            output.motor_right_ratio * controlledRobotMaxSpeed * stepDuration,
        )

        if (move.x < 0 || move.x > fieldWidth || move.y < 0 || move.y > fieldHeight) {
            // console.error('Robot out of bounds', move)
            return
        }

        this.steps.push({ ...move, input, logs, output })
    }

    onSimulationEnd = () => {
        const chunkSize = 3000

        const logs = this.steps
            .slice(1) // The first step is the initial position and doesn't have logs
            .map(step => {
                return step.logs!.map(({ log, level }) => `[${level}] ${log}`).join('')
            })

        console.log(`Logs for ${this.color} robot`)
        for (let startIndex = 0; startIndex < logs.length; startIndex += chunkSize) {
            const sliceLogs = logs.slice(startIndex, startIndex + chunkSize)

            const renumberedLogs: Record<number, string> = {}
            sliceLogs.forEach((item, index) => renumberedLogs[startIndex + index] = item)

            console.log(renumberedLogs)
        }

    }
}
