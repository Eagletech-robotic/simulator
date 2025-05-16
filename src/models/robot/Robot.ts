import { clamp, degreesToRadians } from 'src/utils/maths'
import { AiInstance, StepInput, topInit, topStep } from 'src/utils/wasm-connector'
import { Canvas } from '../Canvas'
import {
    robotWidth,
    robotLength,
    robotWheelbase,
    robotWheelDiameter,
    encoderImpulsesPerWheelTurn,
    robotMaxSpeed,
    stepDuration, fieldWidth, fieldHeight, tofToCenter, shovelExtension, shovelWidth,
} from '../constants'
import { GenericRobot } from './GenericRobot'
import { RobotStep, Log } from './RobotStep'

type Move = Pick<
    RobotStep,
    'x' | 'y' | 'orientation' | 'leftWheelDistance' | 'rightWheelDistance'
>

export class Robot extends GenericRobot {
    readonly type = 'controlled'
    aiInstance: AiInstance | undefined

    readonly width = robotWidth
    readonly length = robotLength

    steps: Array<RobotStep>

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        super(color)
        this.steps = [
            {
                x,
                y,
                orientation,
                carriedBleacher: null,
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

    get editorStep(): RobotStep {
        return this.steps[0]
    }

    get lastStep(): RobotStep {
        return this.steps[this.steps.length - 1]
    }

    buildMove(leftWheelDistance: number, rightWheelDistance: number): Move {
        const step = this.lastStep

        // If both wheels have moved the same distance, the robot has moved forward
        if (leftWheelDistance === rightWheelDistance) {
            return {
                ...this.moveForward(leftWheelDistance),
                leftWheelDistance: step.leftWheelDistance + leftWheelDistance,
                rightWheelDistance: step.rightWheelDistance + rightWheelDistance,
            }
        }

        const signMultiplier = Math.sign(rightWheelDistance - leftWheelDistance)
        const smallestDistance =
            Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance)
                ? rightWheelDistance
                : leftWheelDistance
        const largestDistance =
            Math.abs(leftWheelDistance) > Math.abs(rightWheelDistance)
                ? leftWheelDistance
                : rightWheelDistance
        const bigCircleRadius = robotWheelbase / (1 - smallestDistance / largestDistance)

        const rotationAngle = (rightWheelDistance - leftWheelDistance) / robotWheelbase
        const middleCircleRadius = bigCircleRadius - robotWheelbase / 2 // the circle described by the middle of the robot

        // Update robot position and orientation
        const wheelAxisAngle = step.orientation - (Math.PI / 2) * signMultiplier

        return {
            x: clamp(
                step.x +
                middleCircleRadius * (Math.cos(wheelAxisAngle + rotationAngle) - Math.cos(wheelAxisAngle)),
                0, fieldWidth),

            y: clamp(
                step.y +
                middleCircleRadius * (Math.sin(wheelAxisAngle + rotationAngle) - Math.sin(wheelAxisAngle)),
                0, fieldHeight),
            orientation: step.orientation + rotationAngle,
            leftWheelDistance: step.leftWheelDistance + leftWheelDistance,
            rightWheelDistance: step.rightWheelDistance + rightWheelDistance,
        }
    }

    draw(canvas: Canvas, stepNb: number, isSelected: boolean) {
        const step = this.steps[stepNb]

        for (let i = 0; i < stepNb; i += 50) {
            const color = canvas.getDrawingColor(this.color)
            const opacity = Math.max(1 - (stepNb - i) / 6500, 0)
            canvas.drawEllipse(this.steps[i].x, this.steps[i].y, 0.003, 0.003, 0, color, 'filled', opacity)
        }

        // Carried bleacher
        if (step.carriedBleacher) step.carriedBleacher.draw(canvas)

        // Body and orientation
        canvas.drawEllipse(step.x, step.y, this.width / 2, this.length / 2, step.orientation, canvas.getDrawingColor(this.color), 'filled')
        canvas.drawOrientationLine(step.x, step.y, step.orientation, this.length / 2)

        // Shovel
        const { shovelCenterX, shovelCenterY } = this.shovelCenter(step)
        const opacity = 0.3 + 0.7 * this.shovelRatio(step)
        const colorWithOpacity = `rgba(0, 0, 0, ${opacity})`
        canvas.drawLineFromCenter(shovelCenterX, shovelCenterY, step.orientation + Math.PI / 2, shovelWidth, colorWithOpacity)

        // Selection circle
        if (isSelected) {
            canvas.drawEllipse(step.x, step.y, this.width / 2, this.length / 2, step.orientation, 'red', 'outlined')
        }
    }

    shovelCenter(step: RobotStep) {
        const extension = this.shovelRatio(step) * shovelExtension
        const shovelCenterX = step.x + Math.cos(step.orientation) * (this.length / 2 + extension)
        const shovelCenterY = step.y + Math.sin(step.orientation) * (this.length / 2 + extension)
        return { shovelCenterX, shovelCenterY }
    }

    tofPosition(step: RobotStep) {
        const tofX = step.x + Math.cos(step.orientation) * tofToCenter
        const tofY = step.y + Math.sin(step.orientation) * tofToCenter
        return {
            tofX, tofY, tofOrientation: step.orientation,
        }
    }

    // Returns the shovel extension based on the servo ratio, which is a value between 0 and 1.
    shovelRatio(step: RobotStep) {
        const MIN_VALUE = 0.05
        const MAX_VALUE = 0.105
        const servoRatio = step.output?.servo_pelle_ratio ?? 0
        return (Math.min(Math.max(servoRatio, MIN_VALUE), MAX_VALUE) - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)
    }

    nextStep(eaglePacket: number[] | null, tof: number) {
        const step = this.lastStep
        const previousStep = this.steps[this.steps.length - 2] ?? step

        const wheelCircumference = Math.PI * robotWheelDiameter // meters
        const impulseDistance = wheelCircumference / encoderImpulsesPerWheelTurn // meters

        // console.log('step.rightWheelDistance ', step.rightWheelDistance, 'previousStep.rightWheelDistance ', previousStep.rightWheelDistance, 'delta_encoder_left ', (step.rightWheelDistance - previousStep.rightWheelDistance) / impulseDistance)

        const input: StepInput = {
            jack_removed: 1,
            tof_m: tof,
            delta_yaw: step.orientation - previousStep.orientation,
            delta_encoder_left: (step.leftWheelDistance - previousStep.leftWheelDistance) / impulseDistance,
            delta_encoder_right: (step.rightWheelDistance - previousStep.rightWheelDistance) / impulseDistance,
            imu_yaw: step.orientation,
            imu_accel_x_mss: 0,
            imu_accel_y_mss: 0,
            imu_accel_z_mss: 0,
            blue_button: 0,
            clock_ms: (this.steps.length * stepDuration) * 1000,
        }
        const { output, logs } = topStep(this.aiInstance!, input, eaglePacket || [])

        // Calculate the new position of the robot
        const move = this.buildMove(
            output.motor_left_ratio * robotMaxSpeed * stepDuration,
            output.motor_right_ratio * robotMaxSpeed * stepDuration,
        )

        // If the robot carries a bleacher, clone and move it along wih the robot
        let carriedBleacher = step.carriedBleacher
        if (carriedBleacher) {
            carriedBleacher = carriedBleacher.clone()
            const { shovelCenterX, shovelCenterY } = this.shovelCenter(step)
            carriedBleacher.x = shovelCenterX
            carriedBleacher.y = shovelCenterY
            carriedBleacher.orientation = step.orientation
        }

        // Commit the new step
        this.steps.push({ ...move, carriedBleacher, input, logs, output })
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
