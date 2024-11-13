import { ColorContainer, ColorIndicator } from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import { GenericRobot, ControlledRobot, SequentialRobot } from 'src/models/Robot'
import RobotSelector from '../RobotSelector'
import { MAIN_ROBOT_DIAMETER } from 'src/models/constants'

interface RobotSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    editorRef: React.RefObject<HTMLDivElement>
    gameChanged: () => void
}

const robotTypes: Array<GenericRobot['type']> = ['controlled', 'sequential']

const RobotSelectors = ({
    color,
    game,
    editorRef,
    gameChanged,
}: RobotSelectorsProps): JSX.Element => {
    return (
        <ColorContainer>
            {robotTypes.map((type, index) => (
                <RobotSelector
                    key={index}
                    robotIconSrc={type === 'controlled' ? MainRobotIcon : PamiIcon}
                    onClick={() => {
                        let robot: GenericRobot
                        if (type === 'controlled')
                            robot = new ControlledRobot(color, MAIN_ROBOT_DIAMETER)
                        else robot = new SequentialRobot(color)

                        game.appendRobot(robot)

                        gameChanged()

                        setTimeout(() => {
                            editorRef.current?.scrollTo({
                                top: editorRef.current.scrollHeight,
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
