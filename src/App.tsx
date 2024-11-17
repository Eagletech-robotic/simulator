import { useEffect, useReducer, useRef, useState } from 'react'
import { Page, RobotChooser, StepEditor } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import RobotSelectors from './components/StepEditor/RobotSelectors'
import Editor from './components/StepEditor/Editor'
import GameBoard from './components/GameBoard'
import { Game } from './models/Game'
import { Canvas } from './models/Canvas'

const App = (): JSX.Element => {
    const editorElRef = useRef<HTMLDivElement>(null)
    const canvasElRef = useRef<HTMLCanvasElement>(null)

    const game = useRef(new Game())
    const [canvas, setCanvas] = useState<Canvas | null>(null)

    useEffect(() => {
        if (canvasElRef.current) {
            setCanvas(new Canvas(canvasElRef.current))
        }
    }, [canvasElRef])

    const [, reRender] = useReducer((a) => a + 1, 0)

    const stepChanged = () => {
        reRender()
        if (canvas) {
            game.current.draw(canvas)
        }
    }

    const step = game.current.currentStep
    return (
        <>
            <GlobalStyles />

            <Page>
                <GameBoard ref={canvasElRef} />

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
