import { Game } from 'src/models/Game'
import { EditPiece, Input, PieceAttribute, PieceType, StyledEditor } from './styles'
import { Piece } from 'src/models/piece'

export default function Editor({ game }: { game: Game }) {
    const pieceName = (type: Piece['type']) => {
        switch (type) {
            case 'robot':
                return 'Robot'
            case 'pami':
                return 'Pami'
        }
    }

    const updatePiece = (
        index: number,
        piece: Piece,
        attribute: 'x' | 'y' | 'orientation',
        newValue: number
    ): undefined => {
        piece[attribute] = newValue
        game.updatePiece(index, piece)
    }

    return (
        <StyledEditor>
            {game.getPieces().map((piece, index) => (
                <EditPiece key={index} color={piece.color}>
                    <PieceType>{pieceName(piece.type)}</PieceType>
                    <PieceAttribute>
                        x =
                        <Input
                            type="number"
                            placeholder="0"
                            onChange={(e) =>
                                updatePiece(index, piece, 'x', parseInt(e.target.value))
                            }
                        />
                    </PieceAttribute>
                    <PieceAttribute>
                        y =
                        <Input
                            type="number"
                            placeholder="0"
                            onChange={(e) =>
                                updatePiece(index, piece, 'y', parseInt(e.target.value))
                            }
                        />
                    </PieceAttribute>
                    <PieceAttribute>
                        orientation =
                        <Input
                            type="number"
                            placeholder="0"
                            onChange={(e) =>
                                updatePiece(index, piece, 'orientation', parseInt(e.target.value))
                            }
                        />
                    </PieceAttribute>
                </EditPiece>
            ))}
        </StyledEditor>
    )
}
