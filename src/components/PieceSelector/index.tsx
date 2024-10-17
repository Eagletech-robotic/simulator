import { PieceIcon, StyledPieceSelector } from './styles'

export default function PieceSelector({
    pieceIconSrc,
    onClick,
}: {
    pieceIconSrc: string
    onClick?: () => void
}) {
    return (
        <StyledPieceSelector onClick={onClick}>
            <PieceIcon src={pieceIconSrc} />
        </StyledPieceSelector>
    )
}
