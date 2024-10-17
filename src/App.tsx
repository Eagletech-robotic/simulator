import { useReducer, useState } from 'react'
import { Controls, GameBoard, Page, PieceChooser } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import { Game } from './models/Game'
import PieceSelectors from './components/PieceSelectors'
import Editor from './components/Editor'

export default function App() {
    const [game] = useState(new Game())

    const [, forceRefreshApp] = useReducer((version) => version + 1, 0)

    return (
        <>
            <GlobalStyles />

            <Page>
                <GameBoard />

                <Controls>
                    <PieceChooser>
                        <PieceSelectors color="blue" {...{ game, forceRefreshApp }} />
                        <PieceSelectors color="yellow" {...{ game, forceRefreshApp }} />
                    </PieceChooser>

                    <Editor game={game} />
                </Controls>
            </Page>
        </>
    )
}
