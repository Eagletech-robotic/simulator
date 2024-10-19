export const robots: RobotType[] = [
    { color: 'blue', type: 'main' },
    { color: 'blue', type: 'pami' },
    { color: 'yellow', type: 'main' },
    { color: 'yellow', type: 'pami' },
]

interface RobotType {
    type: 'main' | 'pami'
    color: 'blue' | 'yellow'
}

export interface Robot extends RobotType {
    x: number
    y: number
    orientation: number
}
