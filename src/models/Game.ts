import { Robot } from './robot'

export class Game {
    private robots: Array<Robot>

    constructor() {
        this.robots = []
        this.draw()
    }

    private draw() {
        console.log('Drawing game')
    }

    appendRobot(robot: Robot) {
        this.robots.push(robot)
        this.robots.sort((a, b) => a.y - b.y)
        this.draw()
    }

    updateRobot(index: number, robot: Robot) {
        this.robots[index] = robot
        this.robots.sort((a, b) => a.y - b.y)
        this.draw()
    }

    getRobots() {
        console.log(this.robots)
        return this.robots
    }
}
