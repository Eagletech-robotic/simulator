import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const GameBoardWrapper = styled.div`
    border: 2px solid black;
`

export const GameBoardCanvas = styled.canvas`
    height: 800px;
    width: 800px;
    display: block;
    background-color: ${colors.lightGrey};
`
