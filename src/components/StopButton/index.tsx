import { Icon } from 'src/styles/commonStyles'
import { StyledStopButton } from './styles'
import stopIcon from 'src/assets/stop-icon.svg'

const StopButton = (): JSX.Element => {
    return (
        <StyledStopButton>
            <Icon src={stopIcon} alt="Stop"></Icon>
        </StyledStopButton>
    )
}

export default StopButton
