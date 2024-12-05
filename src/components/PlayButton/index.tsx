import { StyledPlayButton } from './styles'

interface PlayButtonProps {
    isPlaying: boolean
    toggle: () => void
}

const PlayButton = ({ isPlaying, toggle }: PlayButtonProps): JSX.Element => {
    return <StyledPlayButton onClick={toggle}>{isPlaying ? 'Pause' : 'Play'}</StyledPlayButton>
}

export default PlayButton
