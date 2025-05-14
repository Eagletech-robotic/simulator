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
                game.reset()
                gameChanged()
            }}>Reset</Button>

            <Button
                disabled={game.bleachers.length === 0}
                onClick={() => {
                    game.breakBleacher()
                    gameChanged()
                }}>Break Bleacher</Button>

            <Button
                disabled={game.bleachers.length === 0}
                onClick={() => {
                    game.moveBleacherToFinalPosition()
                    gameChanged()
                }}>Move Bleacher Final</Button>
        </Container>
    )
}

export default Objects
