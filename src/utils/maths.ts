export const radiansToDegrees = (radians: number): number => {
    return (radians * 180) / Math.PI
}

export const degreesToRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180
}

// Normalizes an angle to be within the range [-pi, pi) radians.
export const normalizeAngle = (angle: number): number => {
    while (angle < -Math.PI) {
        angle += 2 * Math.PI
    }
    while (angle >= Math.PI) {
        angle -= 2 * Math.PI
    }
    return angle
}

export function randInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
}

export function randAngle(): number {
    return Math.random() * 2 * Math.PI
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

export const cryptoRandom = () => {
    const buf = new Uint32Array(1)
    window.crypto.getRandomValues(buf)
    return buf[0] / (0xFFFFFFFF + 1) // Between 0 and 1
}

