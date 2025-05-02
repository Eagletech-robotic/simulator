import { Canvas } from './Canvas'
import { Plank } from './object/Plank'
import { Can } from './object/Can'
import { Bleacher } from './object/Bleacher'
import { GenericRobot } from './robot/GenericRobot'
import { ControlledRobot } from './robot/ControlledRobot'
import { PamiRobot } from './robot/PamiRobot'
import { randInRange, randAngle } from '../utils/maths'
import { Circle, circlesOverlap, Rectangle, rectangleCircleOverlap, rectangleRectangleOverlap } from '../utils/geometry'
import { bleacherHeight, bleacherWidth, canWidth, controlledRobotWidth } from './constants'

export class Game {
    private _robots: Array<GenericRobot> = []
    private _bleachers: Array<Bleacher> = []
    private _planks: Array<Plank> = []
    private _cans: Array<Can> = []
    private _lastStepNumber = 0

    constructor() {
        this._robots = [
            new ControlledRobot('blue', 1.775, 0.225, Math.PI / 2),
            // new ControlledRobot('blue', .225, 0.875, 0),
            new PamiRobot('blue', 2.925, 1.875, Math.PI),
            new PamiRobot('blue', 2.925, 1.675, Math.PI),

            new ControlledRobot('yellow', 1.225, 0.225, Math.PI / 2),
            // new ControlledRobot('yellow', 2.775, 0.875, Math.PI),
            new PamiRobot('yellow', .075, 1.875, 0),
            new PamiRobot('yellow', .075, 1.675, 0),
        ]
        this.resetObjects()
    }

    resetObjects(): void {
        this._bleachers = [
            new Bleacher(0.075, 0.4, Math.PI / 2),
            new Bleacher(0.075, 1.325, Math.PI / 2),
            new Bleacher(0.775, 0.25, 0),
            new Bleacher(0.825, 1.725, 0),
            new Bleacher(1.1, 0.95, 0),

            new Bleacher(3 - 0.075, 0.4, Math.PI / 2),
            new Bleacher(3 - 0.075, 1.325, Math.PI / 2),
            new Bleacher(3 - 0.775, 0.25, 0),
            new Bleacher(3 - 0.825, 1.725, 0),
            new Bleacher(3 - 1.1, 0.95, 0),
        ]
        this._planks = []
        this._cans = []
    }

    clearObjects(): void {
        this._bleachers = []
        this._planks = []
        this._cans = []
    }

    breakBleacher(): void {
        if (this._bleachers.length === 0) return

        const safeMargin = 0.2
        const minX = safeMargin
        const maxX = 3 - safeMargin
        const minY = safeMargin
        const maxY = 1.5 - safeMargin

        const randomIndex = Math.floor(Math.random() * this._bleachers.length)
        this._bleachers.splice(randomIndex, 1)

        let MAX = 25
        let placed = 0
        while (placed < 2 && --MAX) {
            const p = { x: randInRange(minX, maxX), y: randInRange(minY, maxY), orientation: randAngle() }
            if (this.isRectFree({ ...p, width: bleacherWidth, height: bleacherHeight })) {
                this._planks.push(new Plank(p.x, p.y, p.orientation))
                placed++
            }
        }

        placed = 0
        while (placed < 4 && --MAX) {
            const c: Circle = { x: randInRange(minX, maxX), y: randInRange(minY, maxY), radius: canWidth / 2 }
            if (this.isCircleFree(c)) {
                this._cans.push(new Can(c.x, c.y))
                placed++
            }
        }
    }

    moveBleacherToFinalPosition(): void {
        if (this._bleachers.length === 0) return

        const finalPositions = [
            [0.1, 0.875, Math.PI / 2],
            [0.3, 0.875, Math.PI / 2],
            [0.225, 0.075, 0],
            [0.775, 0.075, 0],
            [1.225, 0.1, 0],
            [1.225, 0.3, 0],
            [3 - 0.1, 0.875, Math.PI / 2],
            [3 - 0.3, 0.875, Math.PI / 2],
            [3 - 0.225, 0.075, 0],
            [3 - 0.775, 0.075, 0],
            [3 - 1.225, 0.1, 0],
            [3 - 1.225, 0.3, 0],
        ]

        const randomIndex = Math.floor(Math.random() * this._bleachers.length)
        const freePositions = finalPositions.filter(([x, y, orientation]) =>
            this.isRectFree({ x, y, width: bleacherWidth, height: bleacherHeight, orientation }),
        )
        if (freePositions.length) {
            const [x, y, orientation] = freePositions[Math.floor(Math.random() * freePositions.length)]
            this._bleachers.splice(randomIndex, 1)
            this._bleachers.push(new Bleacher(x, y, orientation))
        }
    }

    get lastStepNumber() {
        return this._lastStepNumber
    }

    draw(canvas: Canvas, selectedRobotId: number | null = null, stepNb = this._lastStepNumber) {
        canvas.clearCanvas()

        const objects: Array<Bleacher | Plank | Can> = [...this._bleachers, ...this._planks, ...this._cans]
        objects.forEach((object) => {
            object.draw(canvas)
        })

        this._robots.forEach((robot) => {
            robot.draw(canvas, stepNb, robot.id === selectedRobotId)
        })
    }

    get nbRobots() {
        return this._robots.length
    }

    get nbBleachers() {
        return this._bleachers.length
    }

    get firstRobotId() {
        return this._robots[0].id
    }

    async restart() {
        await Promise.all(this._robots.map((robot) => robot.reset()))
        this._lastStepNumber = 0
    }

    get robots() {
        return this._robots
    }

    nextStep(): void {
        this._robots.map((r) => r.nextStep())
        this._lastStepNumber++
    }

    onSimulationEnd() {
        this._robots.forEach((robot) => robot.onSimulationEnd())
    }

    appendRobot(robot: GenericRobot) {
        this._robots.push(robot)
    }

    updateRobot(id: number, newRobot: GenericRobot) {
        const index = this._robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            this._robots[index] = newRobot
        }
    }

    deleteRobot(id: number) {
        const index = this._robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            this._robots.splice(index, 1)
        }
    }

    getRobotById(id: number): GenericRobot | null {
        return this._robots.find((robot) => robot.id === id) || null
    }

    private isCircleFree = (circle: Circle) =>
        !this._robots.some(robot => circlesOverlap(circle, {
            x: robot.lastStep.x,
            y: robot.lastStep.y,
            radius: controlledRobotWidth / 2,
        })) &&
        !this._cans.some(c => circlesOverlap(circle, { x: c.x, y: c.y, radius: canWidth / 2 })) &&
        ![...this._planks, ...this._bleachers].some(rect =>
            rectangleCircleOverlap({
                x: rect.x,
                y: rect.y,
                width: bleacherWidth,
                height: bleacherHeight,
                orientation: rect.orientation,
            }, circle),
        )

    private isRectFree = (rectangle: Rectangle) => {
        return (
            !this._robots.some(robot => rectangleCircleOverlap(rectangle, {
                x: robot.lastStep.x,
                y: robot.lastStep.y,
                radius: controlledRobotWidth / 2,
            })) &&
            !this._cans.some(c => rectangleCircleOverlap(rectangle, { x: c.x, y: c.y, radius: canWidth / 2 })) &&
            ![...this._planks, ...this._bleachers].some(other =>
                rectangleRectangleOverlap(rectangle, {
                    x: other.x,
                    y: other.y,
                    width: bleacherWidth,
                    height: bleacherHeight,
                    orientation: other.orientation,
                }),
            )
        )
    }
}
