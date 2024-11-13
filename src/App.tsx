import { useEffect, useReducer, useRef, useState } from 'react'
import { Controls, Page, RobotChooser } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import { Game } from './models/Game'
import RobotSelectors from './components/Controls/RobotSelectors'
import Editor from './components/Controls/Editor'
import GameBoard from './components/GameBoard'

const App = (): JSX.Element => {
    const editorRef = useRef<HTMLDivElement>(null)
    const canvasElementRef = useRef<HTMLCanvasElement>(null)

    const [game, setGame] = useState<Game | null>(null)
    const [, gameChanged] = useReducer((version) => version + 1, 0)

    useEffect(() => {
        if (canvasElementRef.current) {
            setGame(new Game(canvasElementRef.current))
        }
    }, [canvasElementRef])

    return (
        <>
            <GlobalStyles />

            <Page>
                <GameBoard ref={canvasElementRef} />

                {game && (
                    <Controls>
                        <RobotChooser>
                            <RobotSelectors color="blue" {...{ game, editorRef, gameChanged }} />
                            <RobotSelectors color="yellow" {...{ game, editorRef, gameChanged }} />
                        </RobotChooser>

                        <Editor {...{ game, gameChanged }} ref={editorRef} />
                    </Controls>
                )}
            </Page>
        </>
    )
}

export default App
