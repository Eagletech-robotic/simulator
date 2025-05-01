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
        this.ctx.rotate(-orientation)
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

    drawEllipse(x: number, y: number, width: number, height: number, color: string, style: 'filled' | 'outlined', opacity = 1): void {
        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.ellipse(
            ...toCanvasCoordinates(x, y),
            metricToCanvas(width),
            metricToCanvas(height),
            0,
            0,
            2 * Math.PI)

        if (style === 'outlined') {
            this.ctx.lineWidth = 16
            this.ctx.strokeStyle = color
            this.ctx.stroke()
        } else {
            this.ctx.globalAlpha = opacity
            this.ctx.fillStyle = color
            this.ctx.fill()
        }

        this.ctx.restore()
    }

    drawOrientationLine(x: number, y: number, orientation: number, length: number): void {
        this.ctx.save()

        this.ctx.beginPath()
        const orientationLineX = x + length * Math.cos(orientation)
        const orientationLineY = y + length * Math.sin(orientation)
        this.ctx.strokeStyle = 'black'
        this.ctx.lineWidth = 8
        this.ctx.beginPath()
        this.ctx.moveTo(...toCanvasCoordinates(x, y))
        this.ctx.lineTo(...toCanvasCoordinates(orientationLineX, orientationLineY))
        this.ctx.stroke()

        this.ctx.restore()
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
