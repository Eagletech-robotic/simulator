import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const StyledEditor = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px;
    overflow: auto;
`

export const EditRobot = styled.div<{ color: 'blue' | 'yellow' }>`
    background-color: #e0e0e0;
    border-radius: 5px;
    margin: 10px;
    padding: 1rem;
    border-left: 5px solid ${(props) => (props.color === 'blue' ? colors.blue : colors.yellow)};
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
    width: 4rem;
    height: 1.5rem;
`
