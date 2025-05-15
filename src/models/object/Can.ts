import { Canvas } from '../Canvas'
import { bleacherWidth, canWidth } from '../constants'

export class Can {
    constructor(public x: number, public y: number) {}

    draw(canvas: Canvas) {
        canvas.drawEllipse(this.x, this.y, canWidth / 2, canWidth / 2, 0, 'brown', 'filled')
    }

    clone(): Can {
        return new Can(this.x, this.y)
    }
}
