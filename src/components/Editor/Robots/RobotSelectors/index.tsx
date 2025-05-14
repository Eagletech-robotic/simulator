import { ColorContainer, ColorIndicator } from './styles'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import RobotSelector from '../RobotSelector'
import { Game } from 'src/models/Game'
import { GenericRobot } from 'src/models/robot/GenericRobot'
import { Robot } from 'src/models/robot/Robot'
import { Pami } from 'src/models/robot/Pami'

interface RobotSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    gameChanged: () => void
    editorElRef: React.RefObject<HTMLDivElement>
}

const RobotSelectors = ({
    color,
    game,
    gameChanged,
    editorElRef,
}: RobotSelectorsProps): JSX.Element => {
    return (
        <ColorContainer>
            <RobotSelector
                robotIconSrc={MainRobotIcon}
                onClick={() => {
                    const robot = new Robot(color, 1.5, 1.0, 0)

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
            <ColorIndicator color={color} />
        </ColorContainer>
    )
}

export default RobotSelectors
