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
    orientation: number // radians, 0 is right, positive is counterclockwise

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        this.color = color
        this.id = Math.floor(Math.random() * 1000000)
        this.x = x
        this.y = y
        this.orientation = orientation
    }

    moveForward(distance: number) {
        this.x += Math.cos(this.orientation) * distance
        this.y -= Math.sin(this.orientation) * distance
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

        const multiplier = leftWheelDistance > rightWheelDistance ? 1 : -1
        // Calculate the radius of the circle described by the left wheel
        const leftCircleRadius =
            multiplier * (this.wheelsGap / (1 - rightWheelDistance / leftWheelDistance))
        // The reason is the following: rename leftWheelDistance = a, rightWheelDistance = b, and let r1 be the radius of the circle described by the left wheel, r2 that of the right circle. We have r1 / r2 = a / b. We know that |r1 - r2| = wheelsGap. Let's consider the case r1 > r2, so r2 = r1 - wheelsGap. We substitute this into the ratio equation and get r1 / (r1 - wheelsGap) = a / b. We solve this equation for r1 which yields r1 = wheelsGap / (1 - b / a). In the other case (r2 > r1), we naturally get the opposite (by replacing wheelsGap with -wheelsGap, then doing the same approach).

        const rotationAngleClockwise = leftWheelDistance / leftCircleRadius // definition of the radian
        const middleCircleRadius = leftCircleRadius - (this.wheelsGap / 2) * multiplier // the circle described by the middle of the robot

        // Update robot position and orientation
        this.x +=
            middleCircleRadius *
            (Math.cos(this.orientation + rotationAngleClockwise) - Math.cos(this.orientation))
        this.y -=
            middleCircleRadius *
            (Math.sin(this.orientation) - Math.sin(this.orientation + rotationAngleClockwise))
        this.orientation -= rotationAngleClockwise
    }

    draw(canvas: Canvas) {
        canvas.drawCircle(this.x, this.y, this.width / 2, canvas.getDrawingColor(this.color))
        canvas.drawOrientationLine(this.x, this.y, this.orientation, this.width / 2)
    }

    async nextStep(): Promise<ControlledRobot> {
        const newRobot = new ControlledRobot(this.color, this.x, this.y, this.orientation)
        Object.assign(newRobot, this)

        const output = await serverStep({ encoder1: 10, encoder2: 20 })
        //console.log(output)
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
        //console.log(newRobot)
        return newRobot
    }
}
