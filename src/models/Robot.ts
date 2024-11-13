export abstract class GenericRobot {
    abstract readonly type: 'controlled' | 'sequential'

    readonly color: 'blue' | 'yellow'
    readonly id: number

    x: number // millimeters, 0 is left
    y: number // millimeters, 0 is top
    orientation: number // radians, 0 is right, positive is counterclockwise

    constructor(color: 'blue' | 'yellow') {
        this.color = color
        this.id = Math.floor(Math.random() * 1000000)
        this.x = 0
        this.y = 0
        this.orientation = 0
    }

    setX(x: number) {
        this.x = x
    }

    setY(y: number) {
        this.y = y
    }

    setOrientationFromDegrees(degrees: number) {
        this.orientation = (degrees * Math.PI) / 180
    }
}

export class ControlledRobot extends GenericRobot {
    readonly type = 'controlled'

    wheelsGap: number // millimeters

    constructor(color: 'blue' | 'yellow', wheelsGap: number) {
        super(color)
        this.wheelsGap = wheelsGap
    }

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

    moveForward(distance: number) {
        this.x += Math.cos(this.orientation) * distance
        this.y -= Math.sin(this.orientation) * distance
    }
}

export class SequentialRobot extends GenericRobot {
    readonly type = 'sequential'

    constructor(color: 'blue' | 'yellow') {
        super(color)
    }
}
