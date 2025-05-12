import { useLayoutEffect, useReducer, useRef, useState } from 'react'
import { BoardAndControls, Page } from './styles'
import { GlobalStyles } from './styles/commonStyles'
import GameBoard from './components/GameBoard'
import { Game } from './models/Game'
import { Canvas } from './models/Canvas'
import { defaultGameDurationSeconds, stepDuration } from './models/constants'
import Controls, { ControlsProps } from './components/Controls'
import Editor from './components/Editor'
import Visualizer from './components/Visualizer'

type AppState = 'playing' | 'paused' | 'editing'

const NB_STEPS_PER_PLAYING_INTERVAL = 10

const App = (): JSX.Element => {
    const editorElRef = useRef<HTMLDivElement>(null)

    const [game, _setGame] = useState(new Game())
    const canvasRef = useRef<Canvas | null>(null)

    const [, reRender] = useReducer((a) => a + 1, 0)
    const [redrawStep, redrawCanvas] = useReducer((a) => a + 1, 0)

    const [appState, setAppState] = useState<AppState>('editing')
    const [playingStep, setPlayingStep] = useState(0)
    const [gameDurationSeconds, setGameDurationSeconds] = useState(defaultGameDurationSeconds)
    const [selectedRobotId, setSelectedRobotId] = useState<number | null>(null)

    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const playingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    useLayoutEffect(() => {
        if (canvasRef.current) game.draw(canvasRef.current, selectedRobotId, playingStep)
    }, [selectedRobotId, playingStep, redrawStep])

    const nbSimulationSteps = gameDurationSeconds / stepDuration

    const runSimulation = () => {
        clearInterval(simulationIntervalRef.current || undefined)
        setSelectedRobotId(game.firstRobotId)
        simulationIntervalRef.current = setInterval(() => {
            for (let i = 0; i < 500; i++) {
                game.nextStep()

                if (game.lastStepNumber >= nbSimulationSteps) {
                    clearInterval(simulationIntervalRef.current || undefined)
                    game.onSimulationEnd()
                    break
                }
            }
            reRender()
        }, 0)
    }

    const stopSimulation = async () => {
        clearInterval(playingIntervalRef.current || undefined)
        playingIntervalRef.current = null

        clearInterval(simulationIntervalRef.current || undefined)
        simulationIntervalRef.current = null

        await game.restart()
        setPlayingStep(0)
    }

    const play = () => {
        clearInterval(playingIntervalRef.current || undefined)
        playingIntervalRef.current = setInterval(() => {
            setPlayingStep((prevPlayingStep) => {
                return Math.min(
                    prevPlayingStep + NB_STEPS_PER_PLAYING_INTERVAL,
                    game.lastStepNumber,
                )
            })
        }, (stepDuration * NB_STEPS_PER_PLAYING_INTERVAL) * 1000)
        setAppState("playing")
    }

    const pause = () => {
        clearInterval(playingIntervalRef.current || undefined)
        playingIntervalRef.current = null
        setAppState("paused")
    }

    const onPlayToggle = async () => {
        if (appState === 'editing' && game.nbRobots === 0) {
            alert('Please add a robot to the game before playing.')
            return
        }

        switch (appState) {
            case 'playing':
                pause()
                break
            case 'paused':
                play()
                break
            case 'editing':
                await game.restart()
                runSimulation()
                play()
                break
        }
    }

    const onStop = async () => {
        setAppState('editing')
        await stopSimulation()
        if (canvasRef.current) game.draw(canvasRef.current)
    }

    useLayoutEffect(() => {
        const handleKeydown = async (event: KeyboardEvent) => {
            if (event.key === ' ') {
                event.preventDefault()
                await onPlayToggle()
            } else if (event.key === 'Escape') {
                event.preventDefault()
                await onStop()
            } else if (event.key === '<' && appState === 'paused') {
                event.preventDefault()
                setPlayingStep((prevPlayingStep) => Math.max(prevPlayingStep - 1, 0))
            } else if (event.key === '>' && appState === 'paused') {
                event.preventDefault()
                setPlayingStep((prevPlayingStep) => Math.min(prevPlayingStep + 1, game.lastStepNumber))
            }
        }
        document.addEventListener('keydown', handleKeydown)
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [appState])

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
                            appState,
                            setAppState,
                            gameDurationSeconds,
                            setGameDurationSeconds,
                            nbSimulationSteps,
                            playingStep,
                            setPlayingStep: (playingStep) => {
                                setPlayingStep(playingStep)
                                pause()
                            },
                            game,
                            onPlayToggle,
                            onStop,
                        } satisfies ControlsProps}
                    />
                </BoardAndControls>

                {game &&
                    (appState === 'editing' ? (
                        <Editor {...{ game, editorElRef, gameChanged: redrawCanvas }} />
                    ) : (
                        <Visualizer
                            {...{
                                game,
                                selectedRobotId,
                                setSelectedRobotId,
                                playingStep,
                            }}
                        />
                    ))}
            </Page>
        </>
    )
}

export default App
