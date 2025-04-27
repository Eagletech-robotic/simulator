import { Canvas } from './Canvas'
import { GenericRobot } from './GenericRobot'
import { GenericRobotStep } from './RobotStep'
import { metricToCanvas as c } from '../components/GameBoard'
import { stepDuration } from './constants'

export class SequentialRobot extends GenericRobot {
    readonly type = 'sequential'

    readonly width = 0.15 // meters
    readonly height = 0.15

    steps: Array<GenericRobotStep>

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        super(color)
        this.steps = [{ x, y, orientation }]
    }

    reset() {
        this.steps = [this.steps[0]]
    }

    draw(canvas: Canvas, stepNb: number, isSelected: boolean) {
        const step = this.steps[stepNb]

        const { x, y, orientation } = step
        const { width, height } = this
        const color = canvas.getDrawingColor(this.color)

        canvas.drawRectangle(c(x), c(y), c(width), c(height), orientation, color)
        canvas.drawOrientationLine(c(x), c(y), orientation, c(width / 2))

        if (isSelected) canvas.drawRectangleOutline(c(x), c(y), c(width), c(height), orientation, 'red')
    }

    get lastStep(): GenericRobotStep {
        return this.steps[this.steps.length - 1]
    }

    nextStep() {
        const speed = 0.15 // meters per second
        this.steps.push(this.moveForward(stepDuration * speed))
    }
}
