import { barLabelStyle, colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const Container = styled.div`
    grid-area: playbackProgress;
    position: relative;
    width: 100%;
`

export const Bar = styled.div`
    height: 14px;
    background-color: ${colors.darkGrey};
    border-radius: 0.4rem;
    position: relative;
    overflow: hidden;
`

export const BarProgress = styled.div`
    position: absolute;
    height: 100%;
    background-color: ${colors.blue};
    border-radius: 0.4rem;
    transition: width 0.3s linear;
`

export const Label = styled.div<{ $visible: boolean }>`
    opacity: ${(props) => (props.$visible ? 1 : 0)};
    transition: opacity 0.3s;
    ${barLabelStyle}
`
