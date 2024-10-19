import { Game } from 'src/models/Game'
import { EditRobot, Input, RobotAttribute, RobotType, StyledEditor } from './styles'
import React from 'react'
import { Robot } from 'src/models/Robot'

type RobotAttributeType = 'x' | 'y' | 'orientation'

interface EditorProps {
    game: Game
}

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(({ game }, ref) => {
    return (
        <StyledEditor ref={ref}>
            {game.getRobots().map((robot) => (
                <EditRobot key={robot.id} color={robot.color}>
                    <RobotType>{robotName(robot.type)}</RobotType>
                    <RobotAttribute>
                        x =
                        <RobotInput {...{ robot, attribute: 'x', game }} />
                    </RobotAttribute>
                    <RobotAttribute>
                        y =
                        <RobotInput {...{ robot, attribute: 'y', game }} />
                    </RobotAttribute>
                    <RobotAttribute>
                        orientation =
                        <RobotInput {...{ robot, attribute: 'orientation', game }} />
                    </RobotAttribute>
                </EditRobot>
            ))}
        </StyledEditor>
    )
})

const robotName = (type: Robot['type']) => {
    switch (type) {
        case 'main':
            return 'Main Robot'
        case 'pami':
            return 'Pami'
    }
}

interface RobotInputProps extends EditorProps {
    robot: Robot
    attribute: RobotAttributeType
}

function RobotInput({ robot, attribute, game }: RobotInputProps): JSX.Element {
    return (
        <Input
            type="number"
            placeholder="0"
            onChange={(e) => {
                robot[attribute] = parseInt(e.target.value)
                game.updateRobot(robot.id, robot)
            }}
        />
    )
}

export default Editor
