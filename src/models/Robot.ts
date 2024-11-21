import { Canvas } from './Canvas'
import { stepDurationMs } from './constants'
import { serverStep } from './server'

export abstract class GenericRobot {
    abstract readonly type: 'controlled' | 'sequential'
    abstract readonly width: number
    abstract readonly height: number

    abstract draw(canvas: Canvas): void
    abstract nextStep(): Promise<GenericRobot>

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

    moveFromWheelRotationDistances(leftWheelDistance: number, rightWheelDistance: number) {
        // If both wheels have moved the same distance, the robot has moved forward
        if (leftWheelDistance === rightWheelDistance) {
            this.moveForward(leftWheelDistance)
            return
        }

        const signMultiplier = leftWheelDistance > rightWheelDistance ? 1 : -1
        // Calculate the radius of the circle described by the left wheel
        const leftCircleRadius =
            this.wheelsGap / Math.abs(1 - rightWheelDistance / leftWheelDistance)

        const rotationAngle = (leftWheelDistance / leftCircleRadius) * signMultiplier // definition of the radian
        const middleCircleRadius = leftCircleRadius - (this.wheelsGap / 2) * signMultiplier // the circle described by the middle of the robot

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

    async nextStep(): Promise<ControlledRobot> {
        const newRobot = new ControlledRobot(this.color, this.x, this.y, this.orientation)
        Object.assign(newRobot, this)

        const output = await serverStep({ encoder1: 10, encoder2: 20 })
        newRobot.moveFromWheelRotationDistances(
            output.vitesse1_ratio * stepDurationMs,
            output.vitesse2_ratio * stepDurationMs
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

    async nextStep(): Promise<SequentialRobot> {
        const newRobot = new SequentialRobot(this.color, this.x, this.y, this.orientation)
        Object.assign(newRobot, this)
        newRobot.moveForward(10)
        return newRobot
    }
}
