import GameDuration from './GameDuration'
import PlayButton from './PlayButton'
import ProgressBar from './ProgressBar'
import StopButton from './StopButton'
import { PlaybackBar, SimulationBar, StyledControls } from './styles'
import { Game } from '../../models/Game'

export interface ControlsProps {
    appState: 'playing' | 'paused' | 'editing'
    gameDurationSeconds: number
    setGameDurationSeconds: (gameDurationSeconds: number) => void
    nbSimulationSteps: number
    playingStep: number
    setPlayingStep: (playingStep: number) => void
    game: Game
    onPlayToggle: () => Promise<void>
    onStop: () => Promise<void>
}

const Controls = ({
                      appState,
                      gameDurationSeconds,
                      setGameDurationSeconds,
                      nbSimulationSteps,
                      playingStep,
                      setPlayingStep,
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
                    percentage={(playingStep / nbSimulationSteps) * 100}
                    setPercentage={(percentage: number) => setPlayingStep(Math.min(Math.round(percentage / 100 * nbSimulationSteps), game.lastStepNumber))}
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
                    percentage={(game.lastStepNumber / nbSimulationSteps) * 100}
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
