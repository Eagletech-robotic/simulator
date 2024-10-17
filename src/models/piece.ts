export const pieces: PieceType[] = [
    { color: 'blue', type: 'robot' },
    { color: 'blue', type: 'pami' },
    { color: 'yellow', type: 'robot' },
    { color: 'yellow', type: 'pami' },
]

interface PieceType {
    type: 'robot' | 'pami'
    color: 'blue' | 'yellow'
}

export interface Piece extends PieceType {
    x: number
    y: number
    orientation: number
}
