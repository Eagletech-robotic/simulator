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

        // 2. full size = 1 starter + 7‑byte payload + 1 checksum
        expect(packet.length).toBe(9)

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

    it('encodes packet correctly', () => {
        const game = new Game()

        /* ---------- build a minimal world ---------- */
        game.robots = [
            new Robot('blue', 1.50, 1.00, Math.PI / 4),
            new Robot('yellow', 2.00, 0.50, -Math.PI / 2),
        ]

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

        expect(read(1)).toBe(0)                  // padding bit
    })

    it('encodes the exact same packet as test_eagle_packet.cpp (ManualBitPatternOneObject)', () => {
        /* Build a world matching the decoded values used in the C++ test */

        const game = new Game()

        // Controlled robot (blue)
        game.robots = [
            new Robot('blue', 0.10, 0.20, Math.PI * 7 / 6),   // 10 cm, 20 cm, 210°
            new Robot('yellow', 0.05, 0.06, Math.PI / 2), // 5 cm, 6 cm, 90°
        ]

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
        ]

        const expectedBits = expectedPayload.reduce((bits, byte) => {
            for (let i = 0; i < 8; ++i) bits.push((byte >> i) & 1)
            return bits
        }, [] as number[])
        const expectedFullPacket = buildPacket(expectedBits)

        expect(packet).toEqual(expectedFullPacket)
    })
})
