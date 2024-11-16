import { colors } from 'src/styles/commonStyles'
import { Game } from './Game'

export class Canvas {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private game: Game

    constructor(canvas: HTMLCanvasElement, game: Game) {
        this.canvas = canvas
        this.game = game
        this.ctx = this.canvas.getContext('2d')!
    }

    updateGame(game: Game): void {
        this.game = game
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
        this.ctx.translate(x + width / 2, y + height / 2)
        // Rotate the context
        this.ctx.rotate(-orientation)
        // Draw the rectangle centered at (0, 0)
        this.ctx.fillStyle = color
        this.ctx.fillRect(-width / 2, -height / 2, width, height)

        this.ctx.restore()
    }

    drawCircle(x: number, y: number, radius: number, color: string): void {
        this.ctx.fillStyle = color
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    drawOrientationLine(x: number, y: number, orientation: number, length: number): void {
        const orientationLineX = x + length * Math.cos(orientation)
        const orientationLineY = y - length * Math.sin(orientation)
        this.ctx.strokeStyle = '#000000'
        this.ctx.lineWidth = 8
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        this.ctx.lineTo(orientationLineX, orientationLineY)
        this.ctx.stroke()
    }

    draw() {
        this.clearCanvas()
        this.game.robots.forEach((robot) => robot.draw(this))
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
