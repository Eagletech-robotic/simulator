export const pieces: Piece[] = [
    { color: 'blue', type: 'robot' },
    { color: 'blue', type: 'pami' },
    { color: 'yellow', type: 'robot' },
    { color: 'yellow', type: 'pami' },
]

export type Piece = {
    color: 'blue' | 'yellow'
    type: 'robot' | 'pami'
}
