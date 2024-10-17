import { pieces } from 'src/models/piece'
import PieceSelector from '../PieceSelector'
import { ColorContainer, ColorIndicator } from './styles'
import { Game } from 'src/models/Game'
import RobotIcon from 'src/assets/robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'

interface PieceSelectorsProps {
    color: 'blue' | 'yellow'
    game: Game
    forceRefreshApp: () => void
}

export default function PieceSelectors({ color, game, forceRefreshApp }: PieceSelectorsProps) {
    return (
        <ColorContainer>
            {pieces
                .filter((piece) => piece.color === color)
                .map((piece, index) => (
                    <PieceSelector
                        key={index}
                        pieceIconSrc={piece.type === 'robot' ? RobotIcon : PamiIcon}
                        onClick={() => {
                            game.appendPiece({
                                color,
                                type: piece.type,
                                x: 0,
                                y: 0,
                                orientation: 0,
                            })

                            forceRefreshApp()
                        }}
                    />
                ))}
            <ColorIndicator color={color} />
        </ColorContainer>
    )
}
