import { Container, Label, SliderInput } from './style'

interface GameDurationProps {
    gameDuration: number
    setGameDuration: (gameDuration: number) => void
}

const GameDuration = ({ gameDuration, setGameDuration }: GameDurationProps): JSX.Element => {
    return (
        <Container>
            <SliderInput
                id="game-duration"
                type="range"
                min={1}
                max={200}
                value={gameDuration}
                onChange={(e) => setGameDuration(parseInt(e.target.value))}
            />
            <Label htmlFor="game-duration">{gameDuration} seconds</Label>
        </Container>
    )
}

export default GameDuration
