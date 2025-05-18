import { ColorContainer, ColorIndicator, RobotIcon, StyledRobotSelector } from './styles'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import { Game } from 'src/models/Game'
import { Robot } from 'src/models/robot/Robot'

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
            <StyledRobotSelector
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
                }}>
                <RobotIcon src={MainRobotIcon} />
            </StyledRobotSelector>
            <ColorIndicator color={color} />
        </ColorContainer>
    )
}

export default RobotSelectors
