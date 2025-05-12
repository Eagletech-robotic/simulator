import { colors } from 'src/styles/commonStyles'
import { fieldHeight } from './constants'

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
        color: string,
        style: 'filled' | 'outlined',
    ): void {
        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.translate(...toCanvasCoordinates(x, y))
        this.ctx.rotate(orientation - Math.PI / 2)
        const coordinates = [
            metricToCanvas(-width / 2),
            metricToCanvas(-height / 2),
            metricToCanvas(width),
            metricToCanvas(height),
        ] as [number, number, number, number]

        if (style === 'outlined') {
            this.ctx.lineWidth = 12
            this.ctx.strokeStyle = color
            this.ctx.strokeRect(...coordinates)
            this.ctx.stroke()
        } else {
            this.ctx.fillStyle = color
            this.ctx.fillRect(...coordinates)
        }

        this.ctx.restore()
    }

    drawEllipse(x: number, y: number, width: number, height: number, orientation: number, color: string, style: 'filled' | 'outlined' | 'dashed', opacity = 1): void {
        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.ellipse(
            ...toCanvasCoordinates(x, y),
            metricToCanvas(width),
            metricToCanvas(height),
            -orientation + Math.PI / 2,
            0,
            2 * Math.PI)

        if (style === 'filled') {
            this.ctx.globalAlpha = opacity
            this.ctx.fillStyle = color
            this.ctx.fill()
        } else {
            if (style === 'dashed') {
                this.ctx.setLineDash([10, 10])
                this.ctx.lineWidth = 8
            } else {
                this.ctx.lineWidth = 16
            }
            this.ctx.strokeStyle = color
            this.ctx.stroke()
        }

        this.ctx.restore()
    }

    drawLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string,
        thickness: number = 0.01,
    ): void {
        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = metricToCanvas(thickness)
        this.ctx.moveTo(...toCanvasCoordinates(x1, y1))
        this.ctx.lineTo(...toCanvasCoordinates(x2, y2))
        this.ctx.stroke()

        this.ctx.restore()
    }

    drawOrientationLine(x: number, y: number, orientation: number, length: number): void {
        const endLineX = x + length * Math.cos(orientation)
        const endLineY = y + length * Math.sin(orientation)
        this.drawLine(x, y, endLineX, endLineY, 'black', 0.01)
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

export const toCanvasCoordinates = (x_m: number, y_m: number): [number, number] =>
    [metricToCanvas(x_m), metricToCanvas(fieldHeight - y_m)]

export const metricToCanvas = (m: number) => m * 1000.0

type color = 'blue' | 'yellow'
