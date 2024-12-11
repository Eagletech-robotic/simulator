import React from 'react'
import { GameBoardCanvas, GameBoardWrapper } from './styles'

const GameBoard = React.forwardRef<HTMLCanvasElement>(({}, ref): JSX.Element => {
    return (
        <GameBoardWrapper>
            <GameBoardCanvas ref={ref} height={3000} width={2000} />
        </GameBoardWrapper>
    )
})

export default GameBoard
