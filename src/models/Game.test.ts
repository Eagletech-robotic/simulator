import { describe, it, expect } from 'vitest'
import { Game } from './Game'
import { ControlledRobot } from './robot/ControlledRobot'
import { Plank } from './object/Plank'
import { Can } from './object/Can'
import { Bleacher } from './object/Bleacher'

describe('Game.eaglePacket', () => {
    const callEaglePacket = (g: Game, colour: 'blue' | 'yellow' = 'blue') =>
        // @ts-ignore private field, test only
        (g as any).eaglePacket(colour) as number[] | null

    it('returns a framed packet with valid starter byte, size and checksum', () => {
        const game = new Game()

        // @ts-ignore private fields, test only
        game._bleachers = game._planks = game._cans = []

        const packet = callEaglePacket(game, 'blue')!
        expect(packet).not.toBeNull()

        // 1. starter byte
        expect(packet[0]).toBe(0xff)

        // 2. full size = 1 starter + 128‑byte payload + 1 checksum
        expect(packet.length).toBe(130)

        // 3. checksum correctness
        const payload = packet.slice(1, -1)
        const expectedChecksum = payload.reduce((s, b) => (s + b) & 0xff, 0)
        expect(packet[packet.length - 1]).toBe(expectedChecksum)
    })

    it('returns null when no controlled robot of requested colour exists', () => {
        const game = new Game()
        // remove every robot so the method can’t find a ControlledRobot
        // @ts-ignore
        game._robots = []

        const packet = callEaglePacket(game, 'blue')
        expect(packet).toBeNull()
    })

    it('encodes header + 3 objects correctly', () => {
        const game = new Game()

        /* ---------- build a minimal world ---------- */
        // @ts-ignore
        game._robots = [
            new ControlledRobot('blue', 1.50, 1.00, Math.PI / 4),
            new ControlledRobot('yellow', 2.00, 0.50, -Math.PI / 2),
        ]

        // @ts-ignore
        game._bleachers = [new Bleacher(0.30, 0.20, 0)]
        // @ts-ignore
        game._planks = [new Plank(0.40, 0.30, Math.PI / 3)]
        // @ts-ignore
        game._cans = [new Can(0.10, 0.05)]

        const packet = callEaglePacket(game, 'blue')!
        expect(packet).not.toBeNull()
        const payload = packet.slice(1, -1) // strip starter and checksum

        /* ---------- tiny bit‑reader (LSB‑first) ---------- */
        let bitPos = 0
        const read = (n: number) => {
            let v = 0
            for (let i = 0; i < n; ++i, ++bitPos) {
                const byte = payload[bitPos >> 3]
                const bit = (byte >> (bitPos & 7)) & 1
                v |= bit << i
            }
            return v
        }

        /* ---------- header assertions ---------- */
        expect(read(1)).toBe(0)                  // robot colour (blue)
        expect(read(9)).toBe(150)                // robot x (cm)
        expect(read(8)).toBe(100)                // robot y
        expect(read(9)).toBe(45 + 180)                    // robot θ + 180

        expect(read(9)).toBe(200)                // opponent x
        expect(read(8)).toBe(50)                 // opponent y
        expect(read(9)).toBe(-90 + 180)                   // opponent θ + 180

        const objectCount = read(6)
        expect(objectCount).toBe(3)

        /* ---------- first object (bleacher) ---------- */
        expect(read(2)).toBe(0)        // type 0
        expect(read(6)).toBe(6)        // 30 cm  →  round(30*63/300)=6
        expect(read(5)).toBe(3)        // 20 cm  →  round(20*31/200)=3
        expect(read(3)).toBe(0)

        /* ---------- second object (plank) ---------- */
        expect(read(2)).toBe(1)
        expect(read(6)).toBe(8)        // 40 cm → 8
        expect(read(5)).toBe(5)        // 30 cm → 5
        expect(read(3)).toBe(2)

        /* ---------- third object (can) ---------- */
        expect(read(2)).toBe(2)
        expect(read(6)).toBe(2)        // 10 cm → 2
        expect(read(5)).toBe(1)        //  5 cm → 1
        expect(read(3)).toBe(0)
    })
})
