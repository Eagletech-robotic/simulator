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
    const mainOrientation = rectangle.orientation + Math.PI / 2
    const cos = Math.cos(-mainOrientation),
        sin = Math.sin(-mainOrientation)
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
        const mainOrientation = orientation + Math.PI / 2
        const rx = x + Math.cos(mainOrientation) * cx - Math.sin(mainOrientation) * cy
        const ry = y + Math.sin(mainOrientation) * cx + Math.cos(mainOrientation) * cy
        return rx * ax + ry * ay
    })
    return { min: Math.min(...corners), max: Math.max(...corners) }
}

export const rectangleRectangleOverlap = (a: Rectangle, b: Rectangle) => {
    const ra = Math.hypot(a.width, a.height) / 2,
        rb = Math.hypot(b.width, b.height) / 2
    if (!circlesOverlap({ x: a.x, y: a.y, radius: ra }, { x: b.x, y: b.y, radius: rb })) return false

    const aMainOrientation = a.orientation + Math.PI / 2
    const bMainOrientation = b.orientation + Math.PI / 2

    const axes = [
        [Math.cos(aMainOrientation), Math.sin(aMainOrientation)],
        [-Math.sin(aMainOrientation), Math.cos(aMainOrientation)],
        [Math.cos(bMainOrientation), Math.sin(bMainOrientation)],
        [-Math.sin(bMainOrientation), Math.cos(bMainOrientation)],
    ] as [number, number][]

    for (const [ax, ay] of axes) {
        const pa = project(a, ax, ay)
        const pb = project(b, ax, ay)
        if (pa.max < pb.min || pb.max < pa.min) return false
    }
    return true
}
