import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { ControlButtons, Page, RobotChooser, StepEditor } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import RobotSelectors from './components/StepEditor/RobotSelectors'
import Editor from './components/StepEditor/Editor'
import GameBoard from './components/GameBoard'
import { Game } from './models/Game'
import { Canvas } from './models/Canvas'
import PlayButton from './components/PlayButton'
import { stepDurationMs } from './models/constants'

const App = (): JSX.Element => {
    const editorElRef = useRef<HTMLDivElement>(null)

    const [game, _setGame] = useState(new Game())
    const canvasRef = useRef<Canvas | null>(null)

    useLayoutEffect(() => {
        if (canvasRef.current) game.currentStep.draw(canvasRef.current)
    }, [])

    const [, reRender] = useReducer((a) => a + 1, 0)

    const stepChanged = () => {
        reRender()
        if (canvasRef.current) {
            game.currentStep.draw(canvasRef.current)
        }
    }

    const [isPlaying, setIsPlaying] = useState(false)
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isPlaying) {
            let inStep = false
            intervalIdRef.current = setInterval(async () => {
                if (inStep) {
                    //console.log('Step called before the previous completed.')
                    return
                }

                inStep = true
                await game.step()
                if (canvasRef.current) game.currentStep.draw(canvasRef.current)
                inStep = false
            }, 10)
        } else {
            if (intervalIdRef.current) clearInterval(intervalIdRef.current)
        }
    }, [isPlaying])

    const step = game.currentStep
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
                            <RobotSelectors color="blue" {...{ step, editorElRef, stepChanged }} />
                            <RobotSelectors
                                color="yellow"
                                {...{ step, editorElRef, stepChanged }}
                            />
                        </RobotChooser>

                        <Editor {...{ step, stepChanged }} ref={editorElRef} />
                    </StepEditor>
                )}
            </Page>
        </>
    )
}

export default App
