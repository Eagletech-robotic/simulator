import { GenericRobotStep } from './RobotStep'

export abstract class GenericRobot {
    abstract readonly type: 'controlled' | 'sequential'
    abstract readonly width: number
    abstract readonly length: number

    abstract get lastStep(): GenericRobotStep

    onSimulationEnd(): void {}

    readonly color: 'blue' | 'yellow'
    readonly id: number

    abstract steps: Array<GenericRobotStep>

    constructor(color: 'blue' | 'yellow') {
        this.color = color
        this.id = Math.floor(Math.random() * 1000000)
    }

    moveForward(distance: number): GenericRobotStep {
        const step = this.lastStep

        return {
            x: step.x + Math.cos(step.orientation) * distance,
            y: step.y + Math.sin(step.orientation) * distance,
            orientation: step.orientation,
        }
    }

    setOrientationInDegrees(degrees: number) {
        this.lastStep.orientation = (degrees * Math.PI) / 180
    }

    orientationInDegrees(stepNb = this.steps.length - 1): number {
        return (this.steps[stepNb].orientation * 180) / Math.PI
    }

    get displayName(): string {
        switch (this.type) {
            case 'controlled':
                return 'Robot'
            case 'sequential':
                return 'Pami'
        }
    }
}
