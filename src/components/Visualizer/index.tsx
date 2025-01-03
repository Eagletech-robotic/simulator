import { RobotColorIndicator, RobotIcon, RobotName, SelectedRobot } from './styles'
import { Game } from 'src/models/Game'
import MainRobotIcon from 'src/assets/main-robot-icon.svg'
import PamiIcon from 'src/assets/pami-icon.svg'
import { RightPanel } from 'src/styles/commonStyles'

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
    const robot = game.robots[0]
    return (
        <RightPanel>
            <SelectedRobot>
                <RobotColorIndicator color={robot.color} />
                <RobotIcon src={robot.type === 'controlled' ? MainRobotIcon : PamiIcon} />
                <RobotName>
                    {robot.displayName}: {robot.id}
                </RobotName>
            </SelectedRobot>
        </RightPanel>
    )
}

export default Visualizer
