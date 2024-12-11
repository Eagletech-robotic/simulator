import { ColorContainer, ColorIndicator } from './styles'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import RobotSelector from '../RobotSelector'
import { Game } from 'src/models/Game'
import { GenericRobot } from 'src/models/GenericRobot'
import { ControlledRobot } from 'src/models/ControlledRobot'
import { SequentialRobot } from 'src/models/SequentialRobot'

interface RobotSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    editorElRef: React.RefObject<HTMLDivElement>
    stepChanged: () => void
}

const robotTypes: Array<GenericRobot['type']> = ['controlled', 'sequential']

const RobotSelectors = ({
    color,
    game,
    editorElRef,
    stepChanged,
}: RobotSelectorsProps): JSX.Element => {
    return (
        <ColorContainer>
            {robotTypes.map((type, index) => (
                <RobotSelector
                    key={index}
                    robotIconSrc={type === 'controlled' ? MainRobotIcon : PamiIcon}
                    onClick={() => {
                        let robot: GenericRobot
                        if (type === 'controlled') robot = new ControlledRobot(color, 1500, 1500, 0)
                        else robot = new SequentialRobot(color, 1500, 1500, 0)

                        game.appendRobot(robot)

                        stepChanged()

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
