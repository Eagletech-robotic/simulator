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

    draw(canvas: Canvas, stepNb: number, isSelected: boolean) {
        const step = this.steps[stepNb]

        const { x, y, orientation } = step
        const { width, height } = this
        const color = canvas.getDrawingColor(this.color)

        canvas.drawRectangle(x, y, width, height, orientation, color)
        canvas.drawOrientationLine(x, y, orientation, width / 2)

        if (isSelected) canvas.drawRectangleOutline(x, y, width, height, orientation, 'red')
    }

    get lastStep(): GenericRobotStep {
        return this.steps[this.steps.length - 1]
    }

    nextStep() {
        this.steps.push(this.moveForward(0.25))
    }
}
