import React from 'react'
import { StyledGameBoardCanvas } from './styles'

const GameBoard = React.forwardRef<HTMLCanvasElement>(({}, ref): JSX.Element => {
    return <StyledGameBoardCanvas ref={ref} width={3000} height={2000} />
})

export default GameBoard
