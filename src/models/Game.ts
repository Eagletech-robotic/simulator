import { Robot } from './Robot'

export class Game {
    private robots: Array<Robot>

    constructor() {
        this.robots = []
    }

    appendRobot(robot: Robot) {
        this.robots.push(robot)
    }

    updateRobot(id: number, newRobot: Robot) {
        const index = this.robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            this.robots[index] = newRobot
        }
    }

    getRobots() {
        return this.robots
    }
}
