import { PieceIcon, PieceName, StyledPieceSelector } from './styles'

export default function PieceSelector({ pieceIconSrc }: { pieceIconSrc: string }) {
    return (
        <StyledPieceSelector>
            <PieceIcon src={pieceIconSrc} />
        </StyledPieceSelector>
    )
}
