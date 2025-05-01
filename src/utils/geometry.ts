export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export type Rectangle = { x: number; y: number; width: number; height: number; orientation: number }
export type Circle = { x: number; y: number; radius: number }

export const circlesOverlap = (
    circle1: Circle,
    circle2: Circle,
) => {
    const dx = circle1.x - circle2.x,
        dy = circle1.y - circle2.y
    return dx * dx + dy * dy <= (circle1.radius + circle2.radius) ** 2
}

export const rectangleCircleOverlap = (
    rectangle: Rectangle,
    circle: Circle,
) => {
    const cos = Math.cos(-rectangle.orientation),
        sin = Math.sin(-rectangle.orientation)
    const dx = cos * (circle.x - rectangle.x) + sin * (circle.y - rectangle.y)
    const dy = sin * (circle.x - rectangle.x) - cos * (circle.y - rectangle.y)

    const closestX = clamp(dx, -rectangle.width / 2, rectangle.width / 2)
    const closestY = clamp(dy, -rectangle.height / 2, rectangle.height / 2)
    const ndx = dx - closestX,
        ndy = dy - closestY
    return ndx * ndx + ndy * ndy <= circle.radius * circle.radius
}

const project = ({ x, y, width, height, orientation }: Rectangle, ax: number, ay: number) => {
    const corners = [
        [width / 2, height / 2],
        [-width / 2, height / 2],
        [-width / 2, -height / 2],
        [width / 2, -height / 2],
    ].map(([cx, cy]) => {
        const rx = x + Math.cos(orientation) * cx - Math.sin(orientation) * cy
        const ry = y + Math.sin(orientation) * cx + Math.cos(orientation) * cy
        return rx * ax + ry * ay
    })
    return { min: Math.min(...corners), max: Math.max(...corners) }
}

export const rectangleRectangleOverlap = (a: Rectangle, b: Rectangle) => {
    const ra = Math.hypot(a.width, a.height) / 2,
        rb = Math.hypot(b.width, b.height) / 2
    if (!circlesOverlap({ x: a.x, y: a.y, radius: ra }, { x: b.x, y: b.y, radius: rb })) return false

    const axes = [
        [Math.cos(a.orientation), Math.sin(a.orientation)],
        [-Math.sin(a.orientation), Math.cos(a.orientation)],
        [Math.cos(b.orientation), Math.sin(b.orientation)],
        [-Math.sin(b.orientation), Math.cos(b.orientation)],
    ] as [number, number][]

    for (const [ax, ay] of axes) {
        const pa = project(a, ax, ay)
        const pb = project(b, ax, ay)
        if (pa.max < pb.min || pb.max < pa.min) return false
    }
    return true
}
