import { useLayoutEffect, useReducer, useRef, useState } from 'react'
import { BoardAndControls, Page } from './styles'
import { GlobalStyles } from './styles/commonStyles'
import GameBoard from './components/GameBoard'
import { Game } from './models/Game'
import { Canvas } from './models/Canvas'

import { stepDurationMs } from './models/constants'
import Controls from './components/Controls'
import Editor from './components/Editor'

type AppState = 'playing' | 'paused' | 'editing'

const NB_STEPS_PER_PLAYING_INTERVAL = 30

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

    const [gameDurationSeconds, setGameDurationSeconds] = useState(100)
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const playingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const nbSimulationSteps = (gameDurationSeconds * 1000) / stepDurationMs

    const runSimulation = () => {
        clearInterval(simulationIntervalRef.current || undefined)
        simulationIntervalRef.current = setInterval(() => {
            for (let i = 0; i < 500; i++) {
                game.nextStep()

                if (game.lastStepNumber >= nbSimulationSteps) {
                    clearInterval(simulationIntervalRef.current || undefined)
                    break
                }
            }
            reRender()
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
                <BoardAndControls>
                    <GameBoard
                        ref={(canvasEl) => {
                            if (canvasEl) canvasRef.current = new Canvas(canvasEl)
                        }}
                    />

                    <Controls
                        {...{
                            playingIntervalRef,
                            simulationIntervalRef,
                            nbSimulationSteps,
                            runSimulation,
                            appState,
                            setAppState,
                            gameDurationSeconds,
                            setGameDurationSeconds,
                            playingStep,
                            setPlayingStep,
                            game,
                            canvasRef,
                            stepChanged,
                            nbStepsPerPlayingInterval: NB_STEPS_PER_PLAYING_INTERVAL,
                            play,
                        }}
                    />
                </BoardAndControls>

                {game && <Editor {...{ game, editorElRef, stepChanged }} />}
            </Page>
        </>
    )
}

export default App
