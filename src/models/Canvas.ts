import { colors } from 'src/styles/commonStyles'
import { Game } from './Game'
import { MAIN_ROBOT_DIAMETER, PAMI_ROBOT_SIZE } from './constants'

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

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    private drawRectangle(
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

    private drawCircle(x: number, y: number, radius: number, color: string): void {
        this.ctx.fillStyle = color
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    private drawOrientationLine(x: number, y: number, orientation: number, length: number): void {
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

        this.game.robots.forEach((robot) => {
            if (robot.type === 'controlled') {
                this.drawMainRobot(robot.x, robot.y, robot.orientation, robot.color)
            } else if (robot.type === 'sequential') {
                this.drawPamiRobot(robot.x, robot.y, robot.orientation, robot.color)
            }
        })
    }

    private drawMainRobot(x: number, y: number, orientation: number, color: color): void {
        this.drawCircle(x, y, MAIN_ROBOT_DIAMETER / 2, this.getDrawingColor(color))
        this.drawOrientationLine(x, y, orientation, MAIN_ROBOT_DIAMETER / 2)
    }

    private drawPamiRobot(x: number, y: number, orientation: number, color: color): void {
        const size = PAMI_ROBOT_SIZE
        this.drawRectangle(x, y, size, size, orientation, this.getDrawingColor(color))
        this.drawOrientationLine(x + size / 2, y + size / 2, orientation, size / 2)
    }

    private getDrawingColor(robotColor: color): string {
        if (robotColor === 'blue') {
            return colors.blue
        } else if (robotColor === 'yellow') {
            return colors.yellow
        }

        return '#000000'
    }
}

type color = 'blue' | 'yellow'
