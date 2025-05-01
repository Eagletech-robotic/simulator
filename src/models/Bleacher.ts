import { Canvas } from './Canvas'
import { bleacherHeight, bleacherWidth } from './constants'

export class Bleacher {
    constructor(public x: number, public y: number, public orientation: number) {}

    draw(canvas: Canvas): void {
        canvas.drawRectangle(this.x, this.y, bleacherWidth, bleacherHeight, this.orientation, '#DEB887', 'filled')
    }
}
