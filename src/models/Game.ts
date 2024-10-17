import { Piece } from './piece'

export class Game {
    private pieces: Array<Piece>

    constructor() {
        this.pieces = []
        this.draw()
    }

    private draw() {
        console.log('Drawing game')
    }

    appendPiece(piece: Piece) {
        this.pieces.push(piece)
        this.draw()
    }

    updatePiece(index: number, piece: Piece) {
        this.pieces[index] = piece
        this.draw()
    }

    getPieces() {
        return this.pieces
    }
}
