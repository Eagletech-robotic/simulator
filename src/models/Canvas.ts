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

    drawRectangle(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.fillRect(...toCanvasCoordinates(x, y), metricToCanvas(width), metricToCanvas(height))
        this.ctx.restore()
    }

    drawCenteredRectangle(
        centerX: number,
        centerY: number,
        width: number,
        height: number,
        orientation: number,
        color: string,
        style: 'filled' | 'outlined',
    ): void {
        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.translate(...toCanvasCoordinates(centerX, centerY))
        this.ctx.rotate(-orientation + Math.PI / 2)
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

    drawText(
        x: number,
        y: number,
        text: string,
        color: string = 'black',
        font: string = '40px sans-serif',
        align: CanvasTextAlign = 'center',
    ): void {
        this.ctx.save()
        this.ctx.fillStyle = color
        this.ctx.font = font
        this.ctx.textAlign = align

        const [cx, cy] = toCanvasCoordinates(x, y)
        // invert y because canvas coords origin is top‐left
        this.ctx.fillText(text, cx, cy)
        this.ctx.restore()
    }

    drawOrientationLine(x: number, y: number, orientation: number, length: number): void {
        const endLineX = x + length * Math.cos(orientation)
        const endLineY = y + length * Math.sin(orientation)
        this.drawLine(x, y, endLineX, endLineY, 'black', 0.01)
    }

    drawCenteredLine(x: number, y: number, orientation: number, length: number, color: string): void {
        const halfLength = length / 2
        const startLineX = x - halfLength * Math.cos(orientation)
        const startLineY = y - halfLength * Math.sin(orientation)
        const endLineX = x + halfLength * Math.cos(orientation)
        const endLineY = y + halfLength * Math.sin(orientation)
        this.drawLine(startLineX, startLineY, endLineX, endLineY, color)
    }

    /** Draws a TOF cone and its numeric reading */
    drawTofCone(
        x: number,
        y: number,
        orientation: number,
        range: number,
        halfAngle: number,
        reading: number,
    ): void {
        const startA = orientation - halfAngle
        const endA = orientation + halfAngle

        // boundary points of the cone
        const x1 = x + range * Math.cos(startA)
        const y1 = y + range * Math.sin(startA)
        const x2 = x + range * Math.cos(endA)
        const y2 = y + range * Math.sin(endA)

        // draw the two edges
        const color = '#c0404080'
        this.drawLine(x, y, x1, y1, color, 0.005)
        this.drawLine(x, y, x2, y2, color, 0.005)

        // draw an arc between edges
        this.ctx.beginPath()
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = metricToCanvas(0.005)
        const [cx, cy] = toCanvasCoordinates(x, y)
        this.ctx.arc(cx, cy, metricToCanvas(range), -endA, -startA)
        this.ctx.stroke()

        // draw the reading just beyond the tip
        const textToSensor = range * 0.75
        const tx = x + textToSensor * Math.cos(orientation)
        const ty = y + textToSensor * Math.sin(orientation)
        this.drawText(tx, ty, `${reading.toFixed(2)} m`, '#c04040')
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
