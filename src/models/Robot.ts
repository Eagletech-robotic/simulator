export const CONTROLLED_ROBOT_WHEELS_GAP = 30

export abstract class GenericRobot {
    abstract readonly type: 'controlled' | 'sequential'

    color: 'blue' | 'yellow'
    x: number // millimeters, 0 is left
    y: number // millimeters, 0 is bottom
    orientation: number // radians, 0 is right, positive is counterclockwise (unit circle)
    id: number

    constructor(color: 'blue' | 'yellow') {
        this.color = color
        this.x = 0
        this.y = 0
        this.orientation = 0
        this.id = Math.floor(Math.random() * 1000000)
    }
}

export class ControlledRobot extends GenericRobot {
    readonly type = 'controlled'

    wheelsGap: number // millimeters

    constructor(color: 'blue' | 'yellow', wheelsGap: number) {
        super(color)
        this.wheelsGap = wheelsGap
    }

    private moveFromWheelRotationDistances(leftWheelDistance: number, rightWheelDistance: number) {
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

        // Adjust the position of the robot
        this.orientation -= rotationAngleClockwise // this.orientation is counterclockwise, so we subtract
        this.x += middleCircleRadius - Math.cos(this.orientation) * middleCircleRadius
        this.y += middleCircleRadius * Math.sin(this.orientation)
    }

    private moveForward(distance: number) {
        this.x += Math.cos(this.orientation) * distance // we are on a unit circle of radius: distance
        this.y += Math.sin(this.orientation) * distance // same as above
    }
}

export class SequentialRobot extends GenericRobot {
    readonly type = 'sequential'

    constructor(color: 'blue' | 'yellow') {
        super(color)
    }
}
