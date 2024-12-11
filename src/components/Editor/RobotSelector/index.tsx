import { RobotIcon, StyledRobotSelector } from './styles'

interface RobotSelectorProps {
    robotIconSrc: string
    onClick: () => void
}

const RobotSelector = ({ robotIconSrc, onClick }: RobotSelectorProps): JSX.Element => {
    return (
        <StyledRobotSelector onClick={onClick}>
            <RobotIcon src={robotIconSrc} />
        </StyledRobotSelector>
    )
}

export default RobotSelector
