import { Canvas } from './Canvas'
import { Plank } from './object/Plank'
import { Can } from './object/Can'
import { Bleacher } from './object/Bleacher'
import { Robot } from './robot/Robot'
import { Pami } from './robot/Pami'
import { cryptoRandom, degreesToRadians, randAngle, randInRange } from '../utils/maths'
import {
    Circle,
    circlesOverlap,
    distanceSegmentCircle,
    distanceSegmentSegment,
    Rectangle,
    rectangleCircleOverlap,
    rectangleRectangleOverlap,
} from '../utils/geometry'
import {
    bleacherHeight,
    bleacherLength,
    bleacherWidth, bluetoothMaxStepLatency, bluetoothMinStepLatency,
    canWidth,
    robotLength,
    robotWidth,
    tofHalfAngle,
    tofHeight,
} from './constants'
import { buildPacket } from '../utils/bluetooth'

type GameStep = {
    bleachers: Array<Bleacher>
    planks: Array<Plank>
    cans: Array<Can>
}

// Clockwise order from the center right. Same coordinates & orientation as the C++ kDefaultBleachers table.
export const DEFAULT_BLEACHERS: ReadonlyArray<{ x: number; y: number; orientation: number }> = [
    { x: 3 - 1.100, y: 0.950, orientation: Math.PI / 2 },
    { x: 3 - 0.825, y: 1.725, orientation: Math.PI / 2 },
    { x: 3 - 0.075, y: 1.325, orientation: 0 },
    { x: 3 - 0.075, y: 0.400, orientation: 0 },
    { x: 3 - 0.775, y: 0.250, orientation: Math.PI / 2 },
    { x: 0.775, y: 0.250, orientation: Math.PI / 2 },
    { x: 0.075, y: 0.400, orientation: 0 },
    { x: 0.075, y: 1.325, orientation: 0 },
    { x: 0.825, y: 1.725, orientation: Math.PI / 2 },
    { x: 1.100, y: 0.950, orientation: Math.PI / 2 },
] as const

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
            new Robot('blue', 1.775, robotLength / 2, Math.PI / 2),
            // new Robot('blue', robotLength / 2, 0.875, 0),
            new Robot('yellow', 1.225, robotLength / 2, Math.PI / 2),
            // new Robot('yellow', 3 - robotLength / 2, 0.875, -Math.PI),
        ]
        this.pamis = [
            new Pami('blue', 2.925, 1.875, Math.PI),
            new Pami('blue', 2.925, 1.675, Math.PI),
            new Pami('yellow', .075, 1.875, 0),
            new Pami('yellow', .075, 1.675, 0),
        ]
        this.steps = [{
            bleachers: DEFAULT_BLEACHERS.map(({ x, y, orientation }) => new Bleacher(x, y, orientation)),
            planks: [],
            cans: [],
        }]
    }

    get editorStep(): GameStep {
        return this.steps[0]
    }

    get lastStep(): GameStep {
        return this.steps[this._lastStepNumber]
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
            if (this.isRectangleFree({ ...p, width: bleacherLength, height: bleacherWidth })) {
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
                width: bleacherLength,
                height: bleacherWidth,
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

    draw(canvas: Canvas, selectedRobotId: number | null = null, stepNb = this._lastStepNumber, fieldOpacity = 1) {
        canvas.clearCanvas()

        const step = this.steps[stepNb]
        const objects: Array<Bleacher | Plank | Can> = [...step.bleachers, ...step.planks, ...step.cans]
        objects.forEach((object) => object.draw(canvas))

        this.robots.forEach((robot) => robot.draw(canvas, stepNb, robot.id === selectedRobotId))

        this.pamis.forEach((pami) => pami.draw(canvas, stepNb))

        if (selectedRobotId !== null) {
            const robot = this.getRobotById(selectedRobotId)!
            robot.drawPotentialField(canvas, stepNb, fieldOpacity)
        }
    }

    async restart() {
        await Promise.all([...this.robots, ...this.pamis].map((robot) => robot.reset()))
        this.steps = [this.steps[0]]
        this._lastStepNumber = 0
    }

    nextStep(): void {
        const SEND_PACKET_EVERY = 40 // number of steps between packets
        const lastStep = this.steps[this._lastStepNumber]

        // Advance robots
        this.robots.forEach((robot) => {
            let eaglePacket: number[] | null = null
            //             if (this.lastStepNumber <= 1) {
            if (this.lastStepNumber % SEND_PACKET_EVERY === 0 && this.lastStepNumber > bluetoothMaxStepLatency) {
                const latencySteps = (bluetoothMinStepLatency + Math.floor((bluetoothMaxStepLatency - bluetoothMinStepLatency) * cryptoRandom()))
                eaglePacket = this.eaglePacket(robot.color, this.lastStepNumber - latencySteps)
            }
            robot.nextStep(eaglePacket, this.tof(robot))
        })

        // Advance PAMIs
        this.pamis.forEach((p) => p.nextStep())

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

    getRobotById(id: number): Robot | null {
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

        if (robotStep.carriedBleacherIndex === null && extended) {
            // Pick up a bleacher if there is any in the shovel area
            const PICK_RADIUS = 0.08
            const index = bleachers.findIndex(b => Math.hypot(b.x - shovelCenterX, b.y - shovelCenterY) < PICK_RADIUS)
            if (index !== -1) {
                robot.lastStep.carriedBleacherIndex = index
            }
        } else if (robotStep.carriedBleacherIndex !== null && !extended) {
            // Drop bleacher
            robot.lastStep.carriedBleacherIndex = null
        } else if (robotStep.carriedBleacherIndex !== null) {
            // If the robot carries a bleacher, move it with the robot
            const { shovelCenterX, shovelCenterY } = robot.shovelCenter(robot.lastStep)
            const carriedBleacher = bleachers[robotStep.carriedBleacherIndex]
            carriedBleacher.x = shovelCenterX + Math.cos(robot.lastStep.orientation) * (bleacherWidth / 2)
            carriedBleacher.y = shovelCenterY + Math.sin(robot.lastStep.orientation) * (bleacherWidth / 2)
            carriedBleacher.orientation = robot.lastStep.orientation
        }

        // Return the updated objects
        return { bleachers, planks, cans }
    }

    private tof(robot: Robot): number {
        const stepNumber = Math.max(this._lastStepNumber - (25 + Math.floor(cryptoRandom() * 5)), 0)

        const TOF_MAX_DETECTION = 1.0
        const TOF_CARRYING_BLEACHER = 0.40
        const TOF_MIN_FOR_BLEACHER = 0.26

        const robotStep = robot.steps[stepNumber]
        if (robotStep.carriedBleacherIndex !== null) return TOF_CARRYING_BLEACHER

        const { tofX, tofY, tofOrientation } = robot.tofPosition(robotStep)
        const leftRayAngle = tofOrientation - tofHalfAngle
        const rightRayAngle = tofOrientation + tofHalfAngle

        const rayEnds = [
            [tofX + Math.cos(leftRayAngle) * TOF_MAX_DETECTION,
                tofY + Math.sin(leftRayAngle) * TOF_MAX_DETECTION],
            [tofX + Math.cos(rightRayAngle) * TOF_MAX_DETECTION,
                tofY + Math.sin(rightRayAngle) * TOF_MAX_DETECTION],
        ] as const

        let minDistance = TOF_MAX_DETECTION

        const robotRadius = robotWidth / 2

        // bleachers (rectangles)
        const hx = bleacherLength / 2
        const hy = bleacherWidth / 2

        for (const bleacher of this.steps[stepNumber].bleachers) {
            const cos = Math.cos(bleacher.orientation + Math.PI / 2)
            const sin = Math.sin(bleacher.orientation + Math.PI / 2)

            const corners = [
                [bleacher.x + hx * cos - hy * sin, bleacher.y + hx * sin + hy * cos],
                [bleacher.x - hx * cos - hy * sin, bleacher.y - hx * sin + hy * cos],
                [bleacher.x - hx * cos + hy * sin, bleacher.y - hx * sin - hy * cos],
                [bleacher.x + hx * cos + hy * sin, bleacher.y + hx * sin - hy * cos],
            ] as const

            const segments: [number, number, number, number][] = [
                [...corners[0], ...corners[1]],
                [...corners[1], ...corners[2]],
                [...corners[2], ...corners[3]],
                [...corners[3], ...corners[0]],
            ]

            for (const [endX, endY] of rayEnds) {
                for (const [sx1, sy1, sx2, sy2] of segments) {
                    const distance2d = distanceSegmentSegment(
                        tofX, tofY, endX, endY, sx1, sy1, sx2, sy2,
                    )
                    if (distance2d === null) continue

                    const dz = Math.abs(tofHeight - bleacherHeight)
                    let distance = Math.sqrt(distance2d * distance2d + dz * dz)
                    if (distance < TOF_MIN_FOR_BLEACHER) distance = TOF_CARRYING_BLEACHER
                    if (distance < minDistance) minDistance = distance
                }
            }
        }

        // robots (circles)
        for (const other of this.robots) {
            if (other.id === robot.id) continue
            for (const [endX, endY] of rayEnds) {
                const distance = distanceSegmentCircle(
                    tofX, tofY, endX, endY,
                    other.steps[stepNumber].x, other.steps[stepNumber].y, robotRadius,
                )
                if (distance !== null && distance < minDistance) {
                    minDistance = distance
                }
            }
        }

        // Return the distance to the nearest object
        return minDistance
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
                    width: bleacherLength,
                    height: bleacherWidth,
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
                    width: bleacherLength,
                    height: bleacherWidth,
                    orientation: other.orientation,
                }),
            )
        )
    }

    /**
     * Build an Eagle Bluetooth packet for the given color.
     * Array content: [ 0xFF, <payload bytes…>, <8‑bit checksum> ].
     */
    private eaglePacket(color: 'blue' | 'yellow', stepNumber: number, randomise = true): number[] | null {
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

        // 0. robot colour (blue=0, yellow=1)
        pushBits(myRobot.color === 'yellow' ? 1 : 0, 1)

        // 1. robot detected – in the simulation the controlled robot is always detected
        pushBits(1, 1)

        // 2-18. robot pose
        const randomisePose = (pose: { x: number; y: number; orientation: number }) => (randomise ? {
            x: pose.x + (Math.random() * 0.04 - 0.02), // ±2 cm
            y: pose.y + (Math.random() * 0.04 - 0.02), // ±2 cm
            orientation: pose.orientation + degreesToRadians(Math.random() * 4 - 2), // ±2 degrees
        } : pose)
        const robotPose = randomisePose(myRobot.steps[stepNumber])
        pushBits(toCm(robotPose.x), 9)
        pushBits(toCm(robotPose.y), 8)
        pushBits(toDeg(robotPose.orientation) & 0x1FF, 9)

        // 28. opponent detected
        const opponentDetected = !!opponentRobot
        pushBits(opponentDetected ? 1 : 0, 1)

        // 29-54. opponent pose (or zeros if not detected)
        if (opponentDetected) {
            const opponentPose = randomisePose(opponentRobot.steps[stepNumber])
            pushBits(toCm(opponentPose.x), 9)
            pushBits(toCm(opponentPose.y), 8)
            pushBits(toDeg(opponentPose.orientation) & 0x1FF, 9)
        } else {
            // fill with zeros for the 9+8+9 bits
            pushBits(0, 9 + 8 + 9)
        }

        // Encapsulate the payload in a packet
        return buildPacket(bits)
    }
}
