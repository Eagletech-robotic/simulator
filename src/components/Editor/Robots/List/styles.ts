import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const StyledList = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0.6rem;
    overflow: auto;
`

export const EditRobot = styled.div<{ color: 'blue' | 'yellow' }>`
    background-color: ${colors.lightGrey};
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

export const StyledDeleteButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    padding: 1.5rem;
    border: none;
    background-color: ${colors.lightGrey};

    &:hover {
        background-color: ${colors.lightGreyHover};
    }
`

export const CrossIcon = styled.img`
    height: 1rem;
    width: 1rem;
`
