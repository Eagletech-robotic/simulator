import { StyledPlayButton } from './styles'
import playIcon from 'src/assets/play-icon.svg'
import pauseIcon from 'src/assets/pause-icon.svg'
import { Icon } from 'src/styles/commonStyles'

interface PlayButtonProps {
    isPlaying: boolean
    toggle: () => void
}

const PlayButton = ({ isPlaying, toggle }: PlayButtonProps): JSX.Element => {
    return (
        <StyledPlayButton onClick={toggle}>
            <Icon src={isPlaying ? pauseIcon : playIcon} />
        </StyledPlayButton>
    )
}

export default PlayButton
