import {
    Body,
    BottomRow,
    Header, Info, InfoLabel, InfoValue, Log, Logs,
    NextRobotButton,
    PreviousRobotButton,
    RobotColorIndicator,
    RobotIcon,
    RobotName,
    RobotTypeIndicator,
    SliderInput,
    TopRow,
} from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import { RightPanel } from 'src/styles/commonStyles'
import { useLayoutEffect, useRef } from 'react'
import { radiansToDegrees } from 'src/utils/maths'

const SwitchRobotIcon = (
    <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

interface VisualizerProps {
    game: Game
    selectedRobotId: number | null
    setSelectedRobotId: React.Dispatch<React.SetStateAction<number | null>>
    playingStep: number
    fieldOpacity: number
    setFieldOpacity: React.Dispatch<React.SetStateAction<number>>
}

const Visualizer = ({
                        game,
                        selectedRobotId,
                        setSelectedRobotId,
                        playingStep,
                        fieldOpacity,
                        setFieldOpacity,
                    }: VisualizerProps): JSX.Element => {
    const headerRef = useRef(null)

    const prevRobot = () => {
        if (game.robots.length) {
            setSelectedRobotId((robotId) => previousRobotId(robotId || game.robots[0].id, game))
        }
    }

    const nextRobot = () => {
        if (game.robots.length) {
            setSelectedRobotId((robotId) =>
                nextRobotId(robotId || game.robots[game.robots.length - 1].id, game),
            )
        }
    }

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') prevRobot()
            else if (event.key === 'ArrowRight') nextRobot()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const robot = selectedRobotId ? game.getRobotById(selectedRobotId) : null
    const step = robot?.steps[playingStep]
    const logs = robot?.steps?.[playingStep]?.logs?.map((log, index) => (
        <Log key={index} $level={log.level}>
            [{log.level}] {log.log}
        </Log>
    ))

    return (
        <RightPanel>
            <Header ref={headerRef.current}>
                <TopRow>
                    <PreviousRobotButton onClick={prevRobot}>{SwitchRobotIcon}</PreviousRobotButton>
                    <RobotName>{robot && `${robot.displayName}`}</RobotName>
                    <NextRobotButton onClick={nextRobot}>{SwitchRobotIcon}</NextRobotButton>
                </TopRow>

                {robot && (
                    <BottomRow>
                        <RobotTypeIndicator>
                            <RobotColorIndicator color={robot.color} />
                            <RobotIcon
                                src={robot.type === 'controlled' ? MainRobotIcon : PamiIcon}
                            />
                        </RobotTypeIndicator>
                    </BottomRow>
                )}
            </Header>

            <Body>
                <Info>
                    <InfoLabel>Playing step:</InfoLabel>
                    <InfoValue>{playingStep}</InfoValue>
                </Info>

                {step && (
                    <Info>
                        <InfoLabel>Position:</InfoLabel>
                        <InfoValue>
                            {step.x.toFixed(3)}m x {step.y.toFixed(3)}m
                            x {radiansToDegrees(step.orientation).toFixed(3)}°
                        </InfoValue>
                    </Info>
                )}

                <Info>
                    <InfoLabel>Field opacity:</InfoLabel>
                    <SliderInput
                        type="range"
                        min={0}
                        max={3}
                        step={1}
                        value={fieldOpacity}
                        onChange={e => setFieldOpacity(Number(e.currentTarget.value))}
                    />
                </Info>

                <Logs>
                    {logs}
                </Logs>
            </Body>
        </RightPanel>
    )
}

const previousRobotId = (selectedRobotId: number, game: Game) => {
    const robotIndex = game.robots.findIndex((robot) => robot.id === selectedRobotId)
    let previousRobotIndex = (robotIndex - 1) % game.robots.length
    if (previousRobotIndex < 0) previousRobotIndex += game.robots.length
    const a = game.robots[previousRobotIndex].id
    return a
}

const nextRobotId = (selectedRobotId: number, game: Game) => {
    const robotIndex = game.robots.findIndex((robot) => robot.id === selectedRobotId)
    const nextRobotIndex = (robotIndex + 1) % game.robots.length
    return game.robots[nextRobotIndex].id
}

export default Visualizer
