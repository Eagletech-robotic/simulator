import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { ControlButtons, Page, RobotChooser, StepEditor } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import RobotSelectors from './components/StepEditor/RobotSelectors'
import Editor from './components/StepEditor/Editor'
import GameBoard from './components/GameBoard'
import { Game } from './models/Game'
import { Canvas } from './models/Canvas'
import PlayButton from './components/PlayButton'

const App = (): JSX.Element => {
    const editorElRef = useRef<HTMLDivElement>(null)

    const [game, _setGame] = useState(new Game())
    const canvasRef = useRef<Canvas | null>(null)

    useLayoutEffect(() => {
        if (canvasRef.current) game.draw(canvasRef.current)
    }, [])

    const [, reRender] = useReducer((a) => a + 1, 0)

    const stepChanged = () => {
        reRender()
        if (canvasRef.current) {
            game.draw(canvasRef.current)
        }
    }

    const [isPlaying, setIsPlaying] = useState(false)
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isPlaying) {
            intervalIdRef.current = setInterval(() => {
                for (let i = 0; i < 100; i++) game.nextStep()

                if (canvasRef.current && game.currentStepNumber % 100 === 0) {
                    game.draw(canvasRef.current)
                }
            }, 0)
        } else {
            if (intervalIdRef.current) clearInterval(intervalIdRef.current)
        }
    }, [isPlaying])

    return (
        <>
            <GlobalStyles />

            <Page>
                <div>
                    <GameBoard
                        ref={(canvasEl) => {
                            if (canvasEl) canvasRef.current = new Canvas(canvasEl)
                        }}
                    />
                    <ControlButtons>
                        <PlayButton isPlaying={isPlaying} toggle={() => setIsPlaying(!isPlaying)} />
                    </ControlButtons>
                </div>

                {game && (
                    <StepEditor>
                        <RobotChooser>
                            <RobotSelectors color="blue" {...{ game, editorElRef, stepChanged }} />
                            <RobotSelectors
                                color="yellow"
                                {...{ game, editorElRef, stepChanged }}
                            />
                        </RobotChooser>

                        <Editor {...{ game, stepChanged }} ref={editorElRef} />
                    </StepEditor>
                )}
            </Page>
        </>
    )
}

export default App
