interface PlayButtonProps {
    isPlaying: boolean
    toggle: () => void
}

const PlayButton = ({ isPlaying, toggle }: PlayButtonProps): JSX.Element => {
    return <button onClick={toggle}>{isPlaying ? 'Pause' : 'Play'}</button>
}

export default PlayButton
