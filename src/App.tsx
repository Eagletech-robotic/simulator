import { useReducer, useRef, useState } from 'react'
import { Controls, Page, RobotChooser } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import { Game } from './models/Game'
import RobotSelectors from './components/Controls/RobotSelectors'
import Editor from './components/Controls/Editor'
import GameBoard from './components/GameBoard'

const App = (): JSX.Element => {
    const [game] = useState(new Game())
    const editorRef = useRef<HTMLDivElement>(null)

    const [, forceRefreshApp] = useReducer((version) => version + 1, 0)

    return (
        <>
            <GlobalStyles />

            <Page>
                <GameBoard game={game} />

                <Controls>
                    <RobotChooser>
                        <RobotSelectors color="blue" {...{ game, editorRef, forceRefreshApp }} />
                        <RobotSelectors color="yellow" {...{ game, editorRef, forceRefreshApp }} />
                    </RobotChooser>

                    <Editor {...{ game, forceRefreshApp }} ref={editorRef} />
                </Controls>
            </Page>
        </>
    )
}

export default App
