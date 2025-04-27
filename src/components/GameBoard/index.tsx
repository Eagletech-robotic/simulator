import React from 'react'
import { StyledGameBoardCanvas } from './styles'
import { fieldHeight, fieldWidth } from 'src/models/constants'
import { metricToCanvas } from 'src/models/Canvas'

const GameBoard = React.forwardRef<HTMLCanvasElement>(({}, ref): JSX.Element => {
    return <StyledGameBoardCanvas ref={ref} width={metricToCanvas(fieldWidth)} height={metricToCanvas(fieldHeight)} />
})

export default GameBoard
