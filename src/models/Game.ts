import { topInit } from 'src/utils/wasm-connector'
import { ControlledRobot, SequentialRobot } from './Robot'
import { Step } from './Step'

export class Game {
    private steps: Step[]
    private _currentStepNumber = 0

    constructor() {
        const startingRobots = [
            new ControlledRobot('blue', 250, 250, Math.PI / 2),
            /*new SequentialRobot('blue', 100, 2900, Math.PI / 2),
            new SequentialRobot('blue', 100, 2700, Math.PI / 2),
            new ControlledRobot('yellow', 2750, 250, -Math.PI / 2),
            new SequentialRobot('yellow', 2900, 2900, -Math.PI / 2),
            new SequentialRobot('yellow', 2900, 2700, -Math.PI / 2),*/
        ]
        this.steps = [new Step(startingRobots)]
        void topInit()
    }

    get currentStep() {
        return this.steps[this._currentStepNumber]
    }

    get currentStepNumber() {
        return this._currentStepNumber
    }

    step() {
        const newStep = this.currentStep.nextStep()
        this.steps.push(newStep)
        this._currentStepNumber++
    }
}
