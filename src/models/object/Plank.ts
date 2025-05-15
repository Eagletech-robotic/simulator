import { Canvas } from '../Canvas'
import { bleacherHeight, bleacherWidth } from '../constants'

export class Plank {
    constructor(public x: number, public y: number, public orientation: number) {}

    draw(canvas: Canvas) {
        canvas.drawRectangle(this.x, this.y, bleacherWidth, bleacherHeight, this.orientation, '#DEB887', 'filled')
    }

    clone(): Plank {
        return new Plank(this.x, this.y, this.orientation)
    }
}
