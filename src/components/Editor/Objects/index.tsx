import { Game } from 'src/models/Game'
import { Button, Container } from './styles'

interface ObjectsProps {
    game: Game
    gameChanged: () => void
}

const Objects = ({ game, gameChanged }: ObjectsProps): JSX.Element => {
    return (
        <Container>
            <Button onClick={() => {
                game.resetBleachers()
                gameChanged()
            }}>Reset Bleachers</Button>
        </Container>
    )
}

export default Objects
