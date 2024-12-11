import GameDuration from './GameDuration'
import PlayButton from './PlayButton'
import ProgressBar from './ProgressBar'
import StopButton from './StopButton'
import { PlaybackBar, SimulationBar, StyledControls } from './styles'

interface ControlsProps {
    appState: 'playing' | 'paused' | 'editing'
    setAppState: (appState: 'playing' | 'paused' | 'editing') => void
    gameDurationSeconds: number
    setGameDurationSeconds: (gameDurationSeconds: number) => void
    playingStep: number
    setPlayingStep: (playingStep: number) => void
    game: any
    canvasRef: any
    play: () => void
    playingIntervalRef: any
    simulatioIntervalRef: any
    nbSimulationSteps: number
    runSimulation: () => void
}

const Controls = ({
    appState,
    setAppState,
    gameDurationSeconds,
    setGameDurationSeconds,
    playingStep,
    setPlayingStep,
    game,
    canvasRef,
    play,
    playingIntervalRef,
    simulatioIntervalRef,
    nbSimulationSteps,
    runSimulation,
}: ControlsProps): JSX.Element => {
    return (
        <StyledControls>
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
                isEditing={appState === 'editing'}
            />
            <PlaybackBar>
                <ProgressBar
                    progressPercentage={(playingStep / nbSimulationSteps) * 100}
                    labelFunction={(progressPercentage: number) =>
                        `Progress: ${progressPercentage.toFixed(2)}%`
                    }
                />
            </PlaybackBar>
            <SimulationBar>
                <ProgressBar
                    progressPercentage={(game.lastStepNumber / nbSimulationSteps) * 100}
                    labelFunction={(progressPercentage: number) =>
                        progressPercentage == 100 ? 'Finished' : 'Simulating...'
                    }
                />
            </SimulationBar>
            <StopButton
                onClick={async () => {
                    setAppState('editing')
                    clearInterval(playingIntervalRef.current || undefined)
                    clearInterval(simulatioIntervalRef.current || undefined)
                    await game.restart()
                    if (canvasRef.current) game.draw(canvasRef.current)
                    setPlayingStep(0)
                }}
            />
        </StyledControls>
    )
}

export default Controls
