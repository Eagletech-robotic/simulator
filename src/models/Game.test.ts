import { describe, it, expect } from 'vitest'
import { DEFAULT_BLEACHERS, Game } from './Game'
import { Robot } from './robot/Robot'
import { Plank } from './object/Plank'
import { Can } from './object/Can'
import { Bleacher } from './object/Bleacher'
import { buildPacket } from '../utils/bluetooth'

describe('Game.eaglePacket', () => {
    const callEaglePacket = (g: Game, colour: 'blue' | 'yellow' = 'blue') =>
        // @ts-ignore private field, test only
        (g as any).eaglePacket(colour, 0) as number[] | null

    it('returns a framed packet with valid starter byte, size and checksum', () => {
        const game = new Game()

        // @ts-ignore private fields, test only
        game._bleachers = game._planks = game._cans = []

        const packet = callEaglePacket(game, 'blue')!
        expect(packet).not.toBeNull()

        // 1. starter byte
        expect(packet[0]).toBe(0xff)

        // 2. full size = 1 starter + 109‑byte payload + 1 checksum
        expect(packet.length).toBe(111)

        // 3. checksum correctness
        const payload = packet.slice(1, -1)
        const expectedChecksum = payload.reduce((s, b) => (s + b) & 0xff, 0)
        expect(packet[packet.length - 1]).toBe(expectedChecksum)
    })

    it('returns null when no controlled robot of requested colour exists', () => {
        const game = new Game()
        // remove every robot so the method can't find a ControlledRobot
        game.robots = []

        const packet = callEaglePacket(game, 'blue')
        expect(packet).toBeNull()
    })

    it('encodes header + 3 objects correctly', () => {
        const game = new Game()

        /* ---------- build a minimal world ---------- */
        game.robots = [
            new Robot('blue', 1.50, 1.00, Math.PI / 4),
            new Robot('yellow', 2.00, 0.50, -Math.PI / 2),
        ]

        const step = game.editorStep
        step.bleachers = [new Bleacher(0.30, 0.20, 0)]
        step.planks = [new Plank(0.40, 0.30, Math.PI / 3)]
        step.cans = [new Can(0.10, 0.05)]

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
        expect(read(1)).toBe(1)                  // robot detected

        expect(read(9)).toBe(150)                // robot x (cm)
        expect(read(8)).toBe(100)                // robot y
        expect(read(9)).toBe(45)                 // robot θ

        expect(read(1)).toBe(1)                  // opponent detected
        expect(read(9)).toBe(200)                // opponent x
        expect(read(8)).toBe(50)                 // opponent y
        expect(read(9)).toBe(270)                // opponent θ

        /* ── initial bleachers (all zero) */
        expect(read(10)).toBe(0)

        const objectCount = read(6)
        expect(objectCount).toBe(3)

        expect(read(1)).toBe(0)                  // padding bits

        /* ---------- first object (bleacher) ---------- */
        expect(read(2)).toBe(0)        // type 0
        expect(read(8)).toBe(26)        // 30 cm  →  round(30*255/300)=26
        expect(read(7)).toBe(13)        // 20 cm  →  round(20*127/200)=13
        expect(read(3)).toBe(0)

        /* ---------- second object (plank) ---------- */
        expect(read(2)).toBe(1)
        expect(read(8)).toBe(34)        // 40 cm → 34
        expect(read(7)).toBe(19)        // 30 cm → 19
        expect(read(3)).toBe(2)

        /* ---------- third object (can) ---------- */
        expect(read(2)).toBe(2)
        expect(read(8)).toBe(9)        // 10 cm → 9
        expect(read(7)).toBe(3)        //  5 cm → 3
        expect(read(3)).toBe(0)
    })

    it('encodes the exact same packet as test_eagle_packet.cpp (ManualBitPatternOneObject)', () => {
        /* Build a world matching the decoded values used in the C++ test */

        const game = new Game()

        // Controlled robot (blue)
        game.robots = [
            new Robot('blue', 0.10, 0.20, Math.PI * 7 / 6),   // 10 cm, 20 cm, 210°
            new Robot('yellow', 0.05, 0.06, Math.PI / 2), // 5 cm, 6 cm, 90°
        ]

        // One bleacher object positioned so that raw_x=12 raw_y=20, θ index = 2 (60°)
        const step = game.editorStep
        step.bleachers = [new Bleacher(0.14, 0.32, Math.PI / 3)]
        step.planks = []
        step.cans = []

        const packet = callEaglePacket(game, 'blue')!

        /* Expected payload taken from test_eagle_packet.cpp ManualBitPatternOneObject */
        const expectedPayload = [
            0b00101010,
            0b10100000,
            0b10010000,
            0b10110110,
            0b10000000,
            0b10000001,
            0b00010110,
            0b00000000,
            0b00000010,
            0b00110000,
            0b01010000,
            0b00000100,
        ]

        const expectedBits = expectedPayload.reduce((bits, byte) => {
            for (let i = 0; i < 8; ++i) bits.push((byte >> i) & 1)
            return bits
        }, [] as number[])
        const expectedFullPacket = buildPacket(expectedBits)

        expect(packet).toEqual(expectedFullPacket)
    })

    it('encodes initial bleachers bits correctly and only non‑default bleachers as objects', () => {
        const game = new Game()
        game.robots = [new Robot('blue', 0, 0, 0)]
        const step = game.editorStep

        // Two default bleachers (indexes 0 and 6) + one non‑default
        step.bleachers = [
            new Bleacher(DEFAULT_BLEACHERS[0].x, DEFAULT_BLEACHERS[0].y, DEFAULT_BLEACHERS[0].orientation),
            new Bleacher(DEFAULT_BLEACHERS[6].x, DEFAULT_BLEACHERS[6].y, DEFAULT_BLEACHERS[6].orientation),
            new Bleacher(0.50, 0.50, 0), // non‑default
        ]
        step.planks = []
        step.cans = []

        const packet = callEaglePacket(game, 'blue')!
        const payload = packet.slice(1, -1)

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

        // skip header up to initial‑bleacher section
        read(55) // colour, detected flags and two full poses (55 bits)

        const bits10 = read(10) // initial bleachers bits
        const expectedBits = (1 << 0) | (1 << 6) // indexes 0 and 6 set → 0b1000001 = 65
        expect(bits10).toBe(expectedBits)

        const objCount = read(6)
        expect(objCount).toBe(1) // only the non‑default one

        read(1) // padding

        // first (and only) object should be the non‑default bleacher
        expect(read(2)).toBe(0) // type bleacher
        const rawX = read(8)
        const rawY = read(7)
        expect(rawX).toBe(Math.round(50 * 255 / 300)) // 0.50 m
        expect(rawY).toBe(Math.round(50 * 127 / 200)) // 0.50 m
        expect(read(3)).toBe(0) // orientation 0°
    })
})
