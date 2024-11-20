import { ControlledRobot, SequentialRobot } from './Robot'
import { serverInit } from './server'
import { Step } from './Step'

export class Game {
    private steps: Step[]
    private currentStepNumber = 0

    constructor() {
        const startingRobots = [
            new ControlledRobot('blue', 250, 250, 0),
            new SequentialRobot('blue', 100, 2900, 0),
            new SequentialRobot('blue', 100, 2700, 0),
            new ControlledRobot('yellow', 2750, 250, Math.PI),
            new SequentialRobot('yellow', 2900, 2900, Math.PI),
            new SequentialRobot('yellow', 2900, 2700, Math.PI),
        ]
        this.steps = [new Step(startingRobots)]
        void serverInit()
    }

    get currentStep() {
        return this.steps[this.currentStepNumber]
    }

    async step() {
        const newStep = await this.currentStep.nextStep()
        this.steps.push(newStep)
        this.currentStepNumber++
    }
}
