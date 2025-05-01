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
                game.resetObjects()
                gameChanged()
            }}>Reset</Button>

            <Button onClick={() => {
                game.clearObjects()
                gameChanged()
            }}>Clear</Button>

            <Button
                disabled={game.nbBleachers === 0}
                onClick={() => {
                    game.messBleacher()
                    gameChanged()
                }}>Mess Bleacher</Button>

            <Button
                disabled={game.nbBleachers === 0}
                onClick={() => {
                    game.moveBleacherToFinalPosition()
                    gameChanged()
                }}>Move Bleacher Final</Button>
        </Container>
    )
}

export default Objects
