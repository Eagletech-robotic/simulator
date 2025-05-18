import { colors } from 'src/styles/commonStyles'
import styled, { css } from 'styled-components'

export const ColorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 25%;
    position: relative;
`

export const ColorIndicator = styled.div<{ color: 'blue' | 'yellow' }>`
    position: absolute;
    bottom: -1rem;
    height: 4px;
    width: 100%;
    background-color: ${(props) => (props.color === 'blue' ? colors.blue : colors.yellow)};
`


export const StyledRobotSelector = styled.button`
    border-radius: 1rem;
    border: none;
    background-color: #c0c0e0;
    padding: 0.5rem;
    cursor: pointer;

    &:hover {
        background-color: #b0b0d0;
    }
`

export const RobotIcon = styled.img`
    width: 3rem;
    height: 3rem;
`
