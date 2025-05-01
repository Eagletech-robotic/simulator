import { Canvas } from '../Canvas'
import { bleacherHeight, bleacherWidth, canWidth } from '../constants'

export class Bleacher {
    constructor(public x: number, public y: number, public orientation: number) {}

    draw(canvas: Canvas): void {
        canvas.drawRectangle(this.x, this.y, bleacherWidth, bleacherHeight, this.orientation, '#DEB887', 'filled')

        const offsets = [
            [-0.15, 0],
            [-0.05, 0],
            [0.05, 0],
            [0.15, 0],
        ]

        for (const [dx, dy] of offsets) {
            const rx = Math.cos(this.orientation) * dx - Math.sin(this.orientation) * dy
            const ry = Math.sin(this.orientation) * dx + Math.cos(this.orientation) * dy
            canvas.drawEllipse(this.x + rx, this.y + ry, canWidth/2, canWidth/2, 'brown', 'dashed')
        }
    }
}
