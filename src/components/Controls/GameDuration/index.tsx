import { Container, Label, SliderInput } from './styles'

interface GameDurationProps {
    gameDuration: number
    isEditing: boolean
    setGameDuration: (gameDuration: number) => void
}

const GameDuration = ({
    gameDuration,
    isEditing,
    setGameDuration,
}: GameDurationProps): JSX.Element => {
    return (
        <Container>
            <SliderInput
                $seconds={gameDuration}
                id="game-duration"
                type="range"
                min={1}
                max={200}
                value={gameDuration}
                onChange={(e) => setGameDuration(parseInt(e.target.value))}
                disabled={!isEditing}
            />
        </Container>
    )
}

export default GameDuration
