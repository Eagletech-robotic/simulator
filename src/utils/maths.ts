export const radiansToDegrees = (radians: number): number => {
    return (radians * 180) / Math.PI
}

export const degreesToRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180
}

export function randInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
}

export function randAngle(): number {
    return Math.random() * 2 * Math.PI
}