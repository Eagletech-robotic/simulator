import { colors } from 'src/styles/commonStyles'

export class Canvas {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')!
    }

    clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawRectangle(
        x: number,
        y: number,
        width: number,
        height: number,
        orientation: number,
        color: string
    ): void {
        this.ctx.save()

        // Translate to the rectangle's center
        this.ctx.translate(x, y)
        // Rotate the context
        this.ctx.rotate(orientation)
        // Draw the rectangle centered at (0, 0)
        this.ctx.fillStyle = color
        this.ctx.fillRect(-width / 2, -height / 2, width, height)

        this.ctx.restore()
    }

    drawRectangleOutline(
        x: number,
        y: number,
        width: number,
        height: number,
        orientation: number,
        color: string
    ) {
        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.translate(x, y)
        this.ctx.rotate(orientation)
        this.ctx.lineWidth = 12
        this.ctx.rect(
            -width / 2,
            -height / 2,
            width - this.ctx.lineWidth / 2,
            height - this.ctx.lineWidth / 2
        )
        this.ctx.strokeStyle = color
        this.ctx.stroke()

        this.ctx.restore()
    }

    drawDisc(x: number, y: number, radius: number, color: string, opacity = 1): void {
        this.ctx.fillStyle = color
        this.ctx.globalAlpha = opacity
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.globalAlpha = 1
    }

    drawCircle(x: number, y: number, radius: number, color: string): void {
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = 16
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius - this.ctx.lineWidth / 2, 0, 2 * Math.PI)
        this.ctx.stroke()
    }

    drawOrientationLine(x: number, y: number, orientation: number, length: number): void {
        const orientationLineX = x + length * Math.sin(orientation)
        const orientationLineY = y - length * Math.cos(orientation)
        this.ctx.strokeStyle = 'black'
        this.ctx.lineWidth = 8
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        this.ctx.lineTo(orientationLineX, orientationLineY)
        this.ctx.stroke()
    }

    getDrawingColor(robotColor: color): string {
        if (robotColor === 'blue') {
            return colors.blue
        } else if (robotColor === 'yellow') {
            return colors.yellow
        }

        return '#000000'
    }
}

type color = 'blue' | 'yellow'
