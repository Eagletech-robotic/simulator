import { Piece } from './piece'

export class Game {
    private pieces: Array<Piece>

    constructor() {
        this.pieces = []
    }

    appendPiece(piece: Piece) {
        this.pieces.push(piece)
    }

    getPieces() {
        return this.pieces
    }
}
