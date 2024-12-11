import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const GameBoardWrapper = styled.div`
    border: 2px solid black;
`

export const GameBoardCanvas = styled.canvas`
    height: 801px;
    width: 534px;
    display: block;
    background-color: ${colors.lightGrey};
`
