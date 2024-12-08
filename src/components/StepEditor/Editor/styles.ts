import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const StyledEditor = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0.6rem;
    overflow: auto;
`

export const EditRobot = styled.div<{ color: 'blue' | 'yellow' }>`
    background-color: ${colors.darkGrey};
    margin: 0.6rem;
    padding: 1rem;
    position: relative;
    border-left: 5px solid ${(props) => (props.color === 'blue' ? colors.blue : colors.yellow)};
    border-radius: 8px;
`

export const RobotType = styled.div`
    font-size: 1rem;
    font-weight: bold;
`

export const RobotAttribute = styled.div`
    font-size: 0.8rem;
    margin-top: 5px;
`

export const Input = styled.input`
    font-size: 0.8rem;
    margin-left: 5px;
    width: 5rem;
    height: 1.5rem;
`
