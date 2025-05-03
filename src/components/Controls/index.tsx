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
    onPlayToggle: () => Promise<void>
    onStop: () => Promise<void>
}

const Controls = ({
    appState,
    setAppState,
    gameDurationSeconds,
    setGameDurationSeconds,
    nbSimulationSteps,
    playingStep,
    game,
    onPlayToggle,
    onStop,
}: ControlsProps): JSX.Element => {
    return (
        <StyledControls>
            <PlayButton
                isPlaying={appState === 'playing'}
                toggle={onPlayToggle}
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

            <StopButton onClick={onStop} />
        </StyledControls>
    )
}

export default Controls
