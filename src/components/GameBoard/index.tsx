import { Game } from 'src/models/Game'
import { GameBoardCanvas, GameBoardWrapper } from './styles'
import { useEffect, useRef } from 'react'
import { ControlledRobot } from 'src/models/Robot'

const GameBoard = ({ game }: { game: Game }): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')!
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = 'lightgray'

            const firstRobot: ControlledRobot = game
                .getRobots()
                .filter((robot) => robot.type === 'controlled')[0] as any
            if (!firstRobot) return

            console.log(firstRobot.x, firstRobot.y, firstRobot.orientation)
            ctx.fillRect(firstRobot.x, canvas.height - firstRobot.y - 20, 20, 20)

            for (let i = 0; i < 300; i++) {
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    firstRobot.moveFromWheelRotationDistances(1, 2)
                    ctx.fillRect(firstRobot.x, canvas.height - firstRobot.y - 20, 20, 20)
                }, i * 30)
            }
        }
    }, [game])

    return (
        <GameBoardWrapper>
            <GameBoardCanvas ref={canvasRef} height={500} width={500} />
        </GameBoardWrapper>
    )
}

export default GameBoard
