import PieceSelector from '../RobotSelector'
import { ColorContainer, ColorIndicator } from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import { Robot } from 'src/models/Robot'

interface PieceSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    editorRef: React.RefObject<HTMLDivElement>
    forceRefreshApp: () => void
}

const robotTypes: Array<Robot['type']> = ['main', 'pami']

export default function PieceSelectors({
    color,
    game,
    editorRef,
    forceRefreshApp,
}: PieceSelectorsProps) {
    return (
        <ColorContainer>
            {robotTypes.map((type, index) => (
                <PieceSelector
                    key={index}
                    pieceIconSrc={type === 'main' ? MainRobotIcon : PamiIcon}
                    onClick={() => {
                        const robot = new Robot(type, color)
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
