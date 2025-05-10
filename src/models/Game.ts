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
import { buildPacket } from '../utils/bluetooth'

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
        const SEND_PACKET_EVERY = 100 // number of steps

        this._robots.map((r) => {
            let eaglePacket: number[] | null = null
            if (r instanceof ControlledRobot && this.lastStepNumber % SEND_PACKET_EVERY === 0) {
                eaglePacket = this.eaglePacket(r.color)
            }
            r.nextStep(eaglePacket)
        })
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

    /**
     * Build an Eagle Bluetooth packet for the given color.
     * Array content: [ 0xFF, <payload bytes…>, <8‑bit checksum> ].
     */
    private eaglePacket(color: 'blue' | 'yellow'): number[] | null {
        // ───────── helpers ─────────
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

        // ───────── pick robots ─────
        const myRobot =
            this._robots.find(r => r instanceof ControlledRobot && r.color === color)
        if (!myRobot) {
            console.warn('Bluetooth requires a controlled robot')
            return null
        }

        const opponentRobot =
            this._robots.find(r => r instanceof ControlledRobot && r.color !== color)

        // ───────── header ──────────
        // 0. robot colour (blue=0, yellow=1)
        pushBits(myRobot.color === 'yellow' ? 1 : 0, 1)

        // 1. robot detected – in the simulation the controlled robot is always detected
        pushBits(1, 1)

        // 2-18. robot pose
        pushBits(toCm(myRobot.lastStep.x), 9)
        pushBits(toCm(myRobot.lastStep.y), 8)
        pushBits(toDeg(myRobot.lastStep.orientation) & 0x1FF, 9)

        // 28. opponent detected
        const opponentDetected = !!opponentRobot
        pushBits(opponentDetected ? 1 : 0, 1)

        // 29-54. opponent pose (or zeros if not detected)
        if (opponentDetected) {
            pushBits(toCm(opponentRobot.lastStep.x), 9)
            pushBits(toCm(opponentRobot.lastStep.y), 8)
            pushBits(toDeg(opponentRobot.lastStep.orientation) & 0x1FF, 9)
        } else {
            // fill with zeros for the 9+8+9 bits
            pushBits(0, 9 + 8 + 9)
        }

        // ───────── objects ─────────
        const objs: { type: number; x: number; y: number; oDeg: number }[] = []
        this._bleachers.forEach(b => objs.push({ type: 0, x: b.x, y: b.y, oDeg: toDeg(b.orientation) }))
        this._planks.forEach(p => objs.push({ type: 1, x: p.x, y: p.y, oDeg: toDeg(p.orientation) }))
        this._cans.forEach(c => objs.push({ type: 2, x: c.x, y: c.y, oDeg: 0 }))

        const objectCount = Math.min(objs.length, 60)
        pushBits(objectCount, 6)

        // 3-bit padding so the header is exactly 64 bits (8 bytes)
        pushBits(0, 3) // padding, must be zero

        // header ends here

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

        // ───────── bits → bytes ────
        const payload: number[] = Array(Math.ceil(bits.length / 8)).fill(0)
        bits.forEach((bit, i) => { if (bit) payload[i >> 3] |= 1 << (i & 7) })

        // ───────── build packet ────────
        const payloadString = String.fromCharCode(...payload)
        return buildPacket(payloadString)
    }
}
