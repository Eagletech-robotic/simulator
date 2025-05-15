import { Canvas } from '../Canvas'
import { bleacherWidth, bleacherLength } from '../constants'

export class Plank {
    constructor(public x: number, public y: number, public orientation: number) {}

    draw(canvas: Canvas) {
        canvas.drawRectangle(this.x, this.y, bleacherLength, bleacherWidth, this.orientation, '#DEB887', 'filled')
    }

    clone(): Plank {
        return new Plank(this.x, this.y, this.orientation)
    }
}
