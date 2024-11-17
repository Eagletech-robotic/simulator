import { Canvas } from './Canvas'
import { Step } from './Step'

export class Game {
    private steps: Step[] = []
    private currentStepNumber = 0

    constructor() {
        this.steps.push(new Step())
    }

    get currentStep() {
        return this.steps[this.currentStepNumber]
    }

    draw(canvas: Canvas) {
        canvas.clearCanvas()
        this.currentStep.robots.forEach((robot) => robot.draw(canvas))
    }
}
