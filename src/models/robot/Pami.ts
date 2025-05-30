import { Canvas } from '../Canvas'
import { GenericRobot } from './GenericRobot'
import { GenericRobotStep } from './RobotStep'
import { pamiWidth, stepDuration } from '../constants'

export class Pami extends GenericRobot {
    readonly type = 'sequential'

    readonly width = pamiWidth
    readonly length = pamiWidth

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

        const { x, y, orientation } = step
        const { width, length } = this
        const color = canvas.getDrawingColor(this.color)

        canvas.drawCenteredRectangle(x, y, width, length, orientation, color, 'filled')
        canvas.drawOrientationLine(x, y, orientation, width / 2)
    }

    get lastStep(): GenericRobotStep {
        return this.steps[this.steps.length - 1]
    }

    nextStep() {
        const PAMI_START_TIME = 90 // seconds
        const PAMI_STOP_TIME = 94
        const timesSinceStart = this.steps.length * stepDuration // seconds

        const speed = timesSinceStart >= PAMI_START_TIME && timesSinceStart <= PAMI_STOP_TIME
            ? 0.3 : 0 // meters per second
        this.steps.push(this.moveForward(stepDuration * speed))
    }
}
