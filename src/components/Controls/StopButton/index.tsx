import { Icon } from 'src/styles/commonStyles'
import { StyledStopButton } from './styles'
import stopIcon from 'src/assets/stop-icon.svg'

interface StopButtonProps {
    onClick: () => void
}

const StopButton = ({ onClick }: StopButtonProps): JSX.Element => {
    return (
        <StyledStopButton onClick={onClick}>
            <Icon src={stopIcon} alt="Stop"></Icon>
        </StyledStopButton>
    )
}

export default StopButton
