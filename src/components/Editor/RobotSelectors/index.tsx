import { ColorContainer, ColorIndicator } from './styles'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import RobotSelector from '../RobotSelector'
import { Game } from 'src/models/Game'
import { GenericRobot } from 'src/models/GenericRobot'
import { ControlledRobot } from 'src/models/ControlledRobot'
import { PamiRobot } from 'src/models/PamiRobot'

interface RobotSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    gameChanged: () => void
    editorElRef: React.RefObject<HTMLDivElement>
}

const robotTypes: Array<GenericRobot['type']> = ['controlled', 'sequential']

const RobotSelectors = ({
    color,
    game,
    gameChanged,
    editorElRef,
}: RobotSelectorsProps): JSX.Element => {
    return (
        <ColorContainer>
            {robotTypes.map((type, index) => (
                <RobotSelector
                    key={index}
                    robotIconSrc={type === 'controlled' ? MainRobotIcon : PamiIcon}
                    onClick={() => {
                        let robot: GenericRobot
                        if (type === 'controlled') robot = new ControlledRobot(color, 1.5, 1.0, 0)
                        else robot = new PamiRobot(color, 1.5, 1.0, 0)

                        game.appendRobot(robot)
                        gameChanged()

                        setTimeout(() => {
                            editorElRef.current?.scrollTo({
                                top: editorElRef.current.scrollHeight,
                                behavior: 'smooth',
                            })
                        }, 0)
                    }}
                />
            ))}
            <ColorIndicator color={color} />
        </ColorContainer>
    )
}

export default RobotSelectors
