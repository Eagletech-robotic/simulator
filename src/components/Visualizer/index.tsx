import {
    BottomRow,
    Header,
    NextRobotButton,
    PreviousRobotButton,
    RobotColorIndicator,
    RobotIcon,
    RobotName,
    RobotTypeIndicator,
    TopRow,
} from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import { RightPanel } from 'src/styles/commonStyles'
import { GenericRobot } from 'src/models/GenericRobot'

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
    setSelectedRobotId: (robotId: number) => void
}

const Visualizer = ({
    game,
    selectedRobotId,
    setSelectedRobotId,
}: VisualizerProps): JSX.Element => {
    if (game.robots.length === 0) {
        return (
            <RightPanel>
                <div
                    style={{
                        fontWeight: 'bold',
                        color: 'red',
                        fontSize: '2rem',
                        textAlign: 'center',
                        alignContent: 'center',
                    }}
                >
                    No robots
                </div>
            </RightPanel>
        )
    }

    const robot: GenericRobot =
        (selectedRobotId && game.getRobotById(selectedRobotId)) ||
        (setSelectedRobotId(game.robots[0].id), game.getRobotById(selectedRobotId!)!)

    return (
        <RightPanel>
            <Header>
                <TopRow>
                    <PreviousRobotButton
                        onClick={() => setSelectedRobotId(previousRobotId(robot.id, game))}
                    >
                        {SwitchRobotIcon}
                    </PreviousRobotButton>

                    <RobotName>
                        {robot.displayName}: {robot.id}
                    </RobotName>

                    <NextRobotButton
                        onClick={() => {
                            setSelectedRobotId(nextRobotId(robot?.id, game))
                        }}
                    >
                        {SwitchRobotIcon}
                    </NextRobotButton>
                </TopRow>

                <BottomRow>
                    <RobotTypeIndicator>
                        <RobotColorIndicator color={robot.color} />
                        <RobotIcon src={robot.type === 'controlled' ? MainRobotIcon : PamiIcon} />
                    </RobotTypeIndicator>
                </BottomRow>
            </Header>
        </RightPanel>
    )
}

const previousRobotId = (selectedRobotId: number, game: Game) => {
    const robotIndex = game.robots.findIndex((robot) => robot.id === selectedRobotId)
    let nextRobotIndex = (robotIndex - 1) % game.robots.length
    if (nextRobotIndex < 0) nextRobotIndex += game.robots.length
    return game.robots[nextRobotIndex].id
}

const nextRobotId = (selectedRobotId: number, game: Game) => {
    const robotIndex = game.robots.findIndex((robot) => robot.id === selectedRobotId)
    const nextRobotIndex = (robotIndex + 1) % game.robots.length
    return game.robots[nextRobotIndex].id
}

export default Visualizer
