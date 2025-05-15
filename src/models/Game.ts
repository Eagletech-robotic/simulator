import { Canvas } from './Canvas'
import { Plank } from './object/Plank'
import { Can } from './object/Can'
import { Bleacher } from './object/Bleacher'
import { GenericRobot } from './robot/GenericRobot'
import { Robot } from './robot/Robot'
import { Pami } from './robot/Pami'
import { randInRange, randAngle, radiansToDegrees } from '../utils/maths'
import { Circle, circlesOverlap, Rectangle, rectangleCircleOverlap, rectangleRectangleOverlap } from '../utils/geometry'
import { bleacherHeight, bleacherWidth, canWidth, robotWidth } from './constants'
import { buildPacket } from '../utils/bluetooth'

type GameStep = {
    bleachers: Array<Bleacher>
    planks: Array<Plank>
    cans: Array<Can>
}

export class Game {
    public robots: Array<Robot> = []
    public pamis: Array<Pami> = []

    public steps: Array<GameStep> = []
    private _lastStepNumber = 0

    constructor() {
        this.reset()
    }

    reset(): void {
        this.robots = [
            new Robot('blue', 1.775, 0.225, Math.PI / 2),
            // new Robot('blue', .225, 0.875, 0),
            new Robot('yellow', 1.225, 0.225, Math.PI / 2),
            // new Robot('yellow', 2.775, 0.875, Math.PI),
        ]
        this.pamis = [
            new Pami('blue', 2.925, 1.875, Math.PI),
            new Pami('blue', 2.925, 1.675, Math.PI),
            new Pami('yellow', .075, 1.875, 0),
            new Pami('yellow', .075, 1.675, 0),
        ]
        this.steps = [{
            bleachers: [
                new Bleacher(0.075, 0.4, 0),
                new Bleacher(0.075, 1.325, 0),
                new Bleacher(0.775, 0.25, Math.PI / 2),
                new Bleacher(0.825, 1.725, Math.PI / 2),
                new Bleacher(1.1, 0.95, Math.PI / 2),

                new Bleacher(3 - 0.075, 0.4, 0),
                new Bleacher(3 - 0.075, 1.325, 0),
                new Bleacher(3 - 0.775, 0.25, Math.PI / 2),
                new Bleacher(3 - 0.825, 1.725, Math.PI / 2),
                new Bleacher(3 - 1.1, 0.95, Math.PI / 2),
            ],
            planks: [],
            cans: [],
        }]
    }

    get editorStep(): GameStep {
        return this.steps[0]
    }

    breakBleacher(): void {
        const { bleachers, planks, cans } = this.editorStep
        if (bleachers.length === 0) return

        const safeMargin = 0.2
        const minX = safeMargin
        const maxX = 3 - safeMargin
        const minY = safeMargin
        const maxY = 1.5 - safeMargin

        const randomIndex = Math.floor(Math.random() * bleachers.length)
        bleachers.splice(randomIndex, 1)

        let MAX = 25
        let placed = 0
        while (placed < 2 && --MAX) {
            const p = { x: randInRange(minX, maxX), y: randInRange(minY, maxY), orientation: randAngle() }
            if (this.isRectangleFree({ ...p, width: bleacherWidth, height: bleacherHeight })) {
                planks.push(new Plank(p.x, p.y, p.orientation))
                placed++
            }
        }

        placed = 0
        while (placed < 4 && --MAX) {
            const c: Circle = { x: randInRange(minX, maxX), y: randInRange(minY, maxY), radius: canWidth / 2 }
            if (this.isCircleFree(c)) {
                cans.push(new Can(c.x, c.y))
                placed++
            }
        }
    }

    moveBleacherToFinalPosition(): void {
        const { bleachers } = this.editorStep
        if (bleachers.length === 0) return

        const finalPositions = [
            [0.1, 0.875, 0],
            [0.3, 0.875, 0],
            [0.225, 0.075, Math.PI / 2],
            [0.775, 0.075, Math.PI / 2],
            [1.225, 0.1, Math.PI / 2],
            [1.225, 0.3, Math.PI / 2],
            [3 - 0.1, 0.875, 0],
            [3 - 0.3, 0.875, 0],
            [3 - 0.225, 0.075, Math.PI / 2],
            [3 - 0.775, 0.075, Math.PI / 2],
            [3 - 1.225, 0.1, Math.PI / 2],
            [3 - 1.225, 0.3, Math.PI / 2],
        ]

        const randomIndex = Math.floor(Math.random() * bleachers.length)
        const freePositions = finalPositions.filter(([x, y, orientation]) =>
            this.isRectangleFree({
                x,
                y,
                width: bleacherWidth,
                height: bleacherHeight,
                orientation,
            }),
        )
        if (freePositions.length) {
            const [x, y, orientation] = freePositions[Math.floor(Math.random() * freePositions.length)]
            bleachers.splice(randomIndex, 1)
            bleachers.push(new Bleacher(x, y, orientation))
        }
    }

    get lastStepNumber() {
        return this._lastStepNumber
    }

    draw(canvas: Canvas, selectedRobotId: number | null = null, stepNb = this._lastStepNumber) {
        canvas.clearCanvas()

        const step = this.steps[stepNb]
        const objects: Array<Bleacher | Plank | Can> = [...step.bleachers, ...step.planks, ...step.cans]
        objects.forEach((object) => object.draw(canvas))

        this.robots.forEach((robot) => robot.draw(canvas, stepNb, robot.id === selectedRobotId))

        this.pamis.forEach((pami) => pami.draw(canvas, stepNb))
    }

    async restart() {
        await Promise.all([...this.robots, ...this.pamis].map((robot) => robot.reset()))
        this._lastStepNumber = 0
    }

    nextStep(): void {
        const SEND_PACKET_EVERY = 100 // number of steps
        const lastStep = this.steps[this._lastStepNumber]

        // Advance robots
        this.robots.map((r) => {
            let eaglePacket: number[] | null = null
            if (this.lastStepNumber % SEND_PACKET_EVERY === 0) {
                eaglePacket = this.eaglePacket(r.color, this.lastStepNumber)
            }
            r.nextStep(eaglePacket)
        })

        // Advance PAMIs
        this.pamis.map((p) => p.nextStep())

        // Build mutable copies for the next step
        let bleachers = lastStep.bleachers.map(b => b.clone())
        let planks = lastStep.planks.map(p => p.clone())
        let cans = lastStep.cans.map(c => c.clone())

        // Make each robot interact with the objects
        this.robots.forEach(robot => {
            const step = this.interactWithRobot(robot, { bleachers, planks, cans })
            bleachers = step.bleachers
            planks = step.planks
            cans = step.cans
        })

        // Commit the step
        this.steps.push({ bleachers, planks, cans })
        this._lastStepNumber++
    }

    onSimulationEnd() {
        this.robots.forEach((robot) => robot.onSimulationEnd())
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

    deleteRobot(id: number) {
        const index = this.robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            this.robots.splice(index, 1)
        }
    }

    getRobotById(id: number): GenericRobot | null {
        return this.robots.find((robot) => robot.id === id) || null
    }

    private interactWithRobot(robot: Robot, { bleachers, planks, cans }: GameStep): GameStep {
        // Return if the game has not yet started
        const robotStep = robot.lastStep
        if (!robotStep.output) return { bleachers, planks, cans }

        // Drop and pick up bleachers
        const ratio = robot.shovelRatio(robotStep)
        const extended = ratio > 0.5
        const { shovelCenterX, shovelCenterY } = robot.shovelCenter(robotStep)

        if (!robotStep.carriedBleacher && extended) {
            // Try to pick up a bleacher
            const PICK_RADIUS = 0.15
            const index = bleachers.findIndex(b => Math.hypot(b.x - shovelCenterX, b.y - shovelCenterY) < PICK_RADIUS)
            if (index !== -1) {
                const bleacher = bleachers.splice(index, 1)[0]
                robot.lastStep.carriedBleacher = bleacher
            }
        } else if (robotStep.carriedBleacher && !extended) {
            // Drop bleacher
            const bleacher = robotStep.carriedBleacher
            bleacher.x = shovelCenterX
            bleacher.y = shovelCenterY
            bleacher.orientation = robotStep.orientation
            bleachers.push(bleacher)
            robot.lastStep.carriedBleacher = null
        }

        // Return the updated objects
        return { bleachers, planks, cans }
    }

    private isCircleFree = (circle: Circle) => {
        const { bleachers, planks, cans } = this.editorStep

        return !this.robots.some(robot => circlesOverlap(circle, {
                x: robot.editorStep.x,
                y: robot.editorStep.y,
                radius: robotWidth / 2,
            })) &&
            !cans.some(c => circlesOverlap(circle, { x: c.x, y: c.y, radius: canWidth / 2 })) &&
            ![...planks, ...bleachers].some(rect =>
                rectangleCircleOverlap({
                    x: rect.x,
                    y: rect.y,
                    width: bleacherWidth,
                    height: bleacherHeight,
                    orientation: rect.orientation,
                }, circle),
            )
    }

    private isRectangleFree = (rectangle: Rectangle) => {
        const { bleachers, planks, cans } = this.editorStep

        return (
            !this.robots.some(robot => rectangleCircleOverlap(rectangle, {
                x: robot.editorStep.x,
                y: robot.editorStep.y,
                radius: robotWidth / 2,
            })) &&
            !cans.some(c => rectangleCircleOverlap(rectangle, {
                x: c.x,
                y: c.y,
                radius: canWidth / 2,
            })) &&
            ![...planks, ...bleachers].some(other =>
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

    /**
     * Build an Eagle Bluetooth packet for the given color.
     * Array content: [ 0xFF, <payload bytes…>, <8‑bit checksum> ].
     */
    private eaglePacket(color: 'blue' | 'yellow', stepNumber: number): number[] | null {
        // Helpers
        const bits: number[] = []
        const pushBits = (v: number, n: number) => {
            for (let i = 0; i < n; ++i) bits.push((v >> i) & 1)
        }
        const toCm = (m: number) => Math.round(m * 100)
        const toDeg = (rad: number) => {
            // Normalize to [0, 360)
            const deg = Math.round((rad * 180) / Math.PI) % 360
            return deg < 0 ? deg + 360 : deg
        }

        // Select robots
        const myRobot = this.robots.find(robot => robot.color === color)
        if (!myRobot) {
            console.warn('Bluetooth requires a robot')
            return null
        }
        const opponentRobot = this.robots.find(r => r.color !== color)

        // Prepare objects
        const objs: { type: number; x: number; y: number; oDeg: number }[] = []
        const { bleachers, planks, cans } = this.steps[stepNumber]
        bleachers.forEach(b => objs.push({ type: 0, x: b.x, y: b.y, oDeg: toDeg(b.orientation) }))
        planks.forEach(p => objs.push({ type: 1, x: p.x, y: p.y, oDeg: toDeg(p.orientation) }))
        cans.forEach(c => objs.push({ type: 2, x: c.x, y: c.y, oDeg: 0 }))

        // HEADER
        // 0. robot colour (blue=0, yellow=1)
        pushBits(myRobot.color === 'yellow' ? 1 : 0, 1)

        // 1. robot detected – in the simulation the controlled robot is always detected
        pushBits(1, 1)

        // 2-18. robot pose
        // TODO: send the position with a random delay (50-200ms?)
        pushBits(toCm(myRobot.lastStep.x), 9)
        pushBits(toCm(myRobot.lastStep.y), 8)
        pushBits(toDeg(myRobot.lastStep.orientation) & 0x1FF, 9)

        // 28. opponent detected
        const opponentDetected = !!opponentRobot
        pushBits(opponentDetected ? 1 : 0, 1)

        // 29-54. opponent pose (or zeros if not detected)
        if (opponentDetected) {
            // TODO: Add a random delay (50-200ms?)
            pushBits(toCm(opponentRobot.lastStep.x), 9)
            pushBits(toCm(opponentRobot.lastStep.y), 8)
            pushBits(toDeg(opponentRobot.lastStep.orientation) & 0x1FF, 9)
        } else {
            // fill with zeros for the 9+8+9 bits
            pushBits(0, 9 + 8 + 9)
        }

        const objectCount = Math.min(objs.length, 60)
        pushBits(objectCount, 6)

        // 3-bit padding so the header is exactly 64 bits (8 bytes)
        pushBits(0, 3) // padding, must be zero

        // OBJECTS
        objs.slice(0, objectCount).forEach(o => {
            pushBits(o.type, 2)

            // 0 – 300 cm  ⇒  0 – 63  (6 bits)
            const rawX = Math.round(toCm(o.x) * 63 / 300)
            pushBits(rawX & 0x3F, 6)

            // 0 – 200 cm  ⇒  0 – 31  (5 bits)
            const rawY = Math.round(toCm(o.y) * 31 / 200)
            pushBits(rawY & 0x1F, 5)

            pushBits(Math.round(o.oDeg / 30) & 0x7, 3)
        })

        // Encapsulate the payload in a packet
        const payload: number[] = Array(Math.ceil(bits.length / 8)).fill(0)
        bits.forEach((bit, i) => { if (bit) payload[i >> 3] |= 1 << (i & 7) })

        const payloadString = String.fromCharCode(...payload)
        return buildPacket(payloadString)
    }
}
