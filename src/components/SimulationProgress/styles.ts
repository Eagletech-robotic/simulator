import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const Container = styled.div`
    margin-left: auto;
    width: 75px;
`

export const ProgressBar = styled.div<{ progressPercentage: number }>`
    height: 16px;
    background-color: ${colors.darkGrey};
    border-radius: 20px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        width: ${(props) => props.progressPercentage}%;
        height: 100%;
        background-color: ${colors.blue};
        border-radius: 20px;
        transition: width 0.3s;
    }
`

export const StateIndicator = styled.div<{ show: boolean }>`
    display: ${(props) => (props.show ? 'block' : 'none')};

    margin-top: 5px;
    text-align: center;
    font-size: 0.8rem;
`
