import { topStep } from 'src/utils/wasm-connector'
import { Canvas } from './Canvas'
import {
    controlledRobotWheelDiameter,
    encoderImpulsesPerWheelTurn,
    stepDurationMs,
} from './constants'

export abstract class GenericRobot {
    abstract readonly type: 'controlled' | 'sequential'
    abstract readonly width: number
    abstract readonly height: number

    abstract draw(canvas: Canvas): void
    abstract nextStep(): GenericRobot

    readonly color: 'blue' | 'yellow'
    readonly id: number

    x: number // millimeters, 0 is left
    y: number // millimeters, 0 is top
    orientation: number // radians, 0 is top, positive is clockwise

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        this.color = color
        this.id = Math.floor(Math.random() * 1000000)
        this.x = x
        this.y = y
        this.orientation = orientation
    }

    moveForward(distance: number) {
        const unitCircleOrientation = -this.orientation + Math.PI / 2
        this.x += Math.cos(unitCircleOrientation) * distance
        this.y -= Math.sin(unitCircleOrientation) * distance
    }

    set orientationInDegrees(degrees: number) {
        this.orientation = (degrees * Math.PI) / 180
    }

    get orientationInDegrees() {
        return (this.orientation * 180) / Math.PI
    }
}

export class ControlledRobot extends GenericRobot {
    readonly type = 'controlled'

    readonly width = 350 // millimeters
    readonly height = 350 // millimeters
    readonly wheelsGap = 320 // millimeters

    leftWheelDistance = 0
    rightWheelDistance = 0

    moveFromWheelRotationDistances(leftWheelDistance: number, rightWheelDistance: number) {
        this.leftWheelDistance += leftWheelDistance
        this.rightWheelDistance += rightWheelDistance

        // If both wheels have moved the same distance, the robot has moved forward
        if (leftWheelDistance === rightWheelDistance) {
            this.moveForward(leftWheelDistance)
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
        const wheelAxisAngle = this.orientation - (Math.PI / 2) * signMultiplier
        this.x +=
            middleCircleRadius *
            (Math.sin(wheelAxisAngle + rotationAngle) - Math.sin(wheelAxisAngle))
        this.y -=
            middleCircleRadius *
            (Math.cos(wheelAxisAngle + rotationAngle) - Math.cos(wheelAxisAngle))
        this.orientation += rotationAngle
    }

    draw(canvas: Canvas) {
        canvas.drawCircle(this.x, this.y, this.width / 2, canvas.getDrawingColor(this.color))
        canvas.drawOrientationLine(this.x, this.y, this.orientation, this.width / 2)
    }

    nextStep(): ControlledRobot {
        const newRobot = new ControlledRobot(this.color, this.x, this.y, this.orientation)
        Object.assign(newRobot, this)

        const wheelCircumference = Math.PI * controlledRobotWheelDiameter // millimeters
        const impulseDistance = wheelCircumference / encoderImpulsesPerWheelTurn // millimeters
        const output = topStep({
            is_jack_gone: 1,
            last_wifi_data: [],
            encoder1: this.leftWheelDistance / impulseDistance,
            encoder2: this.rightWheelDistance / impulseDistance,
            tof: 0,
            gyro: [0, 0, 0],
            accelero: [0, 0, 0],
            compass: [0, 0, 0],
        })
        /*console.log('traveled (mm)', this.leftWheelDistance, this.rightWheelDistance)
        console.log(
            'encoders impulses',
            this.leftWheelDistance / impulseDistance,
            this.rightWheelDistance / impulseDistance
        )
        console.log('reponse', output)*/
        newRobot.moveFromWheelRotationDistances(
            (output.vitesse1_ratio * 300 * stepDurationMs) / 1000, // Max is 1 which is 30 cm/s
            (output.vitesse2_ratio * 300 * stepDurationMs) / 1000
        )
        return newRobot
    }
}

export class SequentialRobot extends GenericRobot {
    readonly type = 'sequential'

    readonly width = 150 // millimeters
    readonly height = 150 // millimeters

    draw(canvas: Canvas) {
        canvas.drawRectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            this.orientation,
            canvas.getDrawingColor(this.color)
        )
        canvas.drawOrientationLine(this.x, this.y, this.orientation, this.width / 2)
    }

    nextStep(): SequentialRobot {
        const newRobot = new SequentialRobot(this.color, this.x, this.y, this.orientation)
        Object.assign(newRobot, this)
        newRobot.moveForward(10)
        return newRobot
    }
}
