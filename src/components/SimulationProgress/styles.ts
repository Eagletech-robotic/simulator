import { barLabelStyle, colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const Container = styled.div`
    grid-area: simulationProgress;
    position: relative;
    width: 100%;
`

export const ProgressBar = styled.div<{ progressPercentage: number }>`
    height: 0.8rem;
    background-color: ${colors.darkGrey};
    border-radius: 0.4rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        width: ${(props) => props.progressPercentage}%;
        height: 100%;
        background-color: ${colors.blue};
        border-radius: 0.4rem;
        transition: width 0.3s;
    }
`

export const StateIndicator = styled.div<{ show: boolean }>`
    display: ${(props) => (props.show ? 'block' : 'none')};

    ${barLabelStyle}
`
