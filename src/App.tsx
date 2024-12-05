import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { ControlButtons, Page, RobotChooser, StepEditor } from './AppStyles'
import { GlobalStyles } from './styles/commonStyles'
import RobotSelectors from './components/StepEditor/RobotSelectors'
import Editor from './components/StepEditor/Editor'
import GameBoard from './components/GameBoard'
import { Game } from './models/Game'
import { Canvas } from './models/Canvas'
import PlayButton from './components/PlayButton'
import GameDuration from './components/GameDuration'
import { stepDurationMs } from './models/constants'
import SimulationProgress from './components/SimulationProgress'

type AppState = 'playing' | 'paused' | 'editing'

const NB_STEPS_PER_PLAYING_INTERVAL = 200

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

    const [appState, setAppState] = useState<AppState>('editing')
    const [playingStep, setPlayingStep] = useState(0)
    const [simulationStep, setSimulationStep] = useState(0)

    const [gameDurationSeconds, setGameDurationSeconds] = useState(100)
    const simulatioIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const playingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const nbSimulationSteps = (gameDurationSeconds * 1000) / stepDurationMs

    const runSimulation = () => {
        clearInterval(simulatioIntervalRef.current || undefined)
        simulatioIntervalRef.current = setInterval(() => {
            for (let i = 0; i < 100; i++) game.nextStep()
            setSimulationStep((prevSimulationStep) => prevSimulationStep + 100)
            if (game.lastStepNumber >= nbSimulationSteps) {
                clearInterval(simulatioIntervalRef.current || undefined)
            }
        }, 0)
    }

    const play = () => {
        clearInterval(playingIntervalRef.current || undefined)
        playingIntervalRef.current = setInterval(() => {
            setPlayingStep((prevPlayingStep) => {
                const playingStep = Math.min(
                    prevPlayingStep + NB_STEPS_PER_PLAYING_INTERVAL,
                    game.lastStepNumber
                )
                if (canvasRef.current) game.draw(canvasRef.current, playingStep)
                return playingStep
            })
        }, stepDurationMs * NB_STEPS_PER_PLAYING_INTERVAL)
    }

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
                        <PlayButton
                            isPlaying={appState === 'playing'}
                            toggle={async () => {
                                const newState = appState === 'playing' ? 'paused' : 'playing'
                                setAppState(newState)
                                if (appState === 'editing') {
                                    await game.restart()
                                    runSimulation()
                                    play()
                                } else {
                                    clearInterval(playingIntervalRef.current || undefined)
                                    if (newState === 'playing') {
                                        play()
                                    }
                                }
                            }}
                        />
                        <GameDuration
                            gameDuration={gameDurationSeconds}
                            setGameDuration={setGameDurationSeconds}
                        />
                        <SimulationProgress
                            progressPercentage={(simulationStep / nbSimulationSteps) * 100}
                        />
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
