import { ColorContainer, ColorIndicator } from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import {
    GenericRobot,
    ControlledRobot,
    SequentialRobot,
    CONTROLLED_ROBOT_WHEELS_GAP,
} from 'src/models/Robot'
import RobotSelector from '../RobotSelector'

interface RobotSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    editorRef: React.RefObject<HTMLDivElement>
    forceRefreshApp: () => void
}

const robotTypes: Array<GenericRobot['type']> = ['controlled', 'sequential']

const RobotSelectors = ({
    color,
    game,
    editorRef,
    forceRefreshApp,
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
                            robot = new ControlledRobot(color, CONTROLLED_ROBOT_WHEELS_GAP)
                        else robot = new SequentialRobot(color)

                        game.appendRobot(robot)

                        forceRefreshApp()

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
