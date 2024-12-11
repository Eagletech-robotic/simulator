import { Canvas } from './Canvas'
import { GenericRobot } from './GenericRobot'
import { GenericRobotStep } from './RobotStep'

export class SequentialRobot extends GenericRobot {
    readonly type = 'sequential'

    readonly width = 150 // millimeters
    readonly height = 150 // millimeters

    steps: Array<GenericRobotStep>

    constructor(color: 'blue' | 'yellow', x: number, y: number, orientation: number) {
        super(color)
        this.steps = [{ x, y, orientation }]
    }

    reset() {
        this.steps = [this.steps[0]]
    }

    draw(canvas: Canvas, stepNb: number) {
        const step = this.steps[stepNb]
        canvas.drawRectangle(
            step.x,
            step.y,
            this.width,
            this.height,
            step.orientation,
            canvas.getDrawingColor(this.color)
        )
        canvas.drawOrientationLine(step.x, step.y, step.orientation, this.width / 2)
    }

    get lastStep(): GenericRobotStep {
        return this.steps[this.steps.length - 1]
    }

    nextStep() {
        this.steps.push(this.moveForward(0.25))
    }
}
