export class Robot {
    type: 'main' | 'pami'
    color: 'blue' | 'yellow'
    x: number
    y: number
    orientation: number
    id: number

    constructor(type: 'main' | 'pami', color: 'blue' | 'yellow') {
        this.type = type
        this.color = color
        this.x = 0
        this.y = 0
        this.orientation = 0
        this.id = Math.floor(Math.random() * 1000000)
    }
}
