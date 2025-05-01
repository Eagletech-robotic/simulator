import GameDuration from './GameDuration'
import PlayButton from './PlayButton'
import ProgressBar from './ProgressBar'
import StopButton from './StopButton'
import { PlaybackBar, SimulationBar, StyledControls } from './styles'

export interface ControlsProps {
    appState: 'playing' | 'paused' | 'editing'
    setAppState: (appState: 'playing' | 'paused' | 'editing') => void
    gameDurationSeconds: number
    setGameDurationSeconds: (gameDurationSeconds: number) => void
    nbSimulationSteps: number
    playingStep: number
    game: any
    canvasRef: any
    play: () => void
    pause: () => void
    runSimulation: () => void
    stopSimulation: () => Promise<void>
}

const Controls = ({
    appState,
    setAppState,
    gameDurationSeconds,
    setGameDurationSeconds,
    nbSimulationSteps,
    playingStep,
    game,
    canvasRef,
    play,
    pause,
    runSimulation,
    stopSimulation,
}: ControlsProps): JSX.Element => {
    return (
        <StyledControls>
            <PlayButton
                isPlaying={appState === 'playing'}
                toggle={async () => {
                    if (appState === 'editing' && game.nbRobots === 0) {
                        alert('Please add a robot to the game before playing.')
                        return
                    }

                    const newState = appState === 'playing' ? 'paused' : 'playing'
                    setAppState(newState)

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
                    labelFunction={() =>
                        `Progress: ${(
                            (playingStep / nbSimulationSteps) *
                            gameDurationSeconds
                        ).toFixed(1)}s / ${gameDurationSeconds}s`
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
                    await stopSimulation()
                    if (canvasRef.current) game.draw(canvasRef.current)
                }}
            />
        </StyledControls>
    )
}

export default Controls
