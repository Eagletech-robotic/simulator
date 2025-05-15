import { Canvas } from '../Canvas'
import { bleacherWidth, bleacherLength, canWidth } from '../constants'

export class Bleacher {
    constructor(public x: number, public y: number, public orientation: number) {}

    draw(canvas: Canvas): void {
        canvas.drawRectangle(this.x, this.y, bleacherLength, bleacherWidth, this.orientation, '#DEB887', 'filled')

        const offsets = [-0.15, -0.05, 0.05, 0.15]

        for (const offset of offsets) {
            const rx = offset * Math.cos(this.orientation + Math.PI / 2)
            const ry = offset * Math.sin(this.orientation + Math.PI / 2)
            canvas.drawEllipse(this.x + rx, this.y + ry, canWidth / 2, canWidth / 2, 0, 'brown', 'dashed')
        }
    }

    clone(): Bleacher {
        return new Bleacher(this.x, this.y, this.orientation)
    }
}
