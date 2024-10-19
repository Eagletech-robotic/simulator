import { Game } from 'src/models/Game'
import { EditPiece, Input, PieceAttribute, PieceType, StyledEditor } from './styles'
import { Piece } from 'src/models/piece'
import React from 'react'

type PieceAttribute = 'x' | 'y' | 'orientation'

interface EditorProps {
    game: Game
}

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(({ game }, ref) => {
    return (
        <StyledEditor ref={ref}>
            {game.getPieces().map((piece, index) => (
                <EditPiece key={index} color={piece.color}>
                    <PieceType>{pieceName(piece.type)}</PieceType>
                    <PieceAttribute>
                        x =
                        <PieceInput {...{ index, piece, attribute: 'x', game }} />
                    </PieceAttribute>
                    <PieceAttribute>
                        y =
                        <PieceInput {...{ index, piece, attribute: 'y', game }} />
                    </PieceAttribute>
                    <PieceAttribute>
                        orientation =
                        <PieceInput {...{ index, piece, attribute: 'orientation', game }} />
                    </PieceAttribute>
                </EditPiece>
            ))}
        </StyledEditor>
    )
})

const pieceName = (type: Piece['type']) => {
    switch (type) {
        case 'robot':
            return 'Robot'
        case 'pami':
            return 'Pami'
    }
}

function PieceInput({
    index,
    piece,
    attribute,
    game,
}: {
    index: number
    piece: Piece
    attribute: PieceAttribute
    game: Game
}): JSX.Element {
    return (
        <Input
            type="number"
            placeholder="0"
            onChange={(e) => {
                piece[attribute] = parseInt(e.target.value)
                game.updatePiece(index, piece)
            }}
        />
    )
}

export default Editor
