import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const SelectedRobot = styled.div`
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    padding: 1rem;
    background-color: ${colors.darkGrey};
`

export const RobotColorIndicator = styled.div<{ color: 'yellow' | 'blue' }>`
    height: 1rem;
    width: 1rem;
    background-color: ${(props) => (props.color === 'yellow' ? colors.yellow : colors.blue)};
    border-radius: 50%;
    margin: 0 0.5rem;
`

export const RobotIcon = styled.img`
    width: 2rem;
    height: 2rem;
`

export const RobotName = styled.div`
    text-align: center;
`
