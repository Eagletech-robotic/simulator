import React from 'react'
import { StyledGameBoardCanvas } from './styles'
import { fieldHeight, fieldWidth } from 'src/models/constants'

const GameBoard = React.forwardRef<HTMLCanvasElement>(({}, ref): JSX.Element => {
    return <StyledGameBoardCanvas ref={ref} width={metricToCanvas(fieldWidth)} height={metricToCanvas(fieldHeight)} />
})

export const metricToCanvas = (f: number) => f * 1000.0

export default GameBoard
