import PieceSelector from '../RobotSelector'
import { ColorContainer, ColorIndicator } from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import { robots } from 'src/models/robot'

interface PieceSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    editorRef: React.RefObject<HTMLDivElement>
    forceRefreshApp: () => void
}

export default function PieceSelectors({
    color,
    game,
    editorRef,
    forceRefreshApp,
}: PieceSelectorsProps) {
    return (
        <ColorContainer>
            {robots
                .filter((robot) => robot.color === color)
                .map((robot, index) => (
                    <PieceSelector
                        key={index}
                        pieceIconSrc={robot.type === 'main' ? MainRobotIcon : PamiIcon}
                        onClick={() => {
                            game.appendRobot({
                                color,
                                type: robot.type,
                                x: 0,
                                y: 0,
                                orientation: 0,
                            })

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
