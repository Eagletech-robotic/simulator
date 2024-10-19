import { Game } from 'src/models/Game'
import { EditRobot, Input, RobotAttribute, RobotType, StyledEditor } from './styles'
import React from 'react'
import { Robot } from 'src/models/robot'

type RobotAttribute = 'x' | 'y' | 'orientation'

interface EditorProps {
    game: Game
}

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(({ game }, ref) => {
    return (
        <StyledEditor ref={ref}>
            {game.getRobots().map((robot, index) => (
                <EditRobot key={index} color={robot.color}>
                    <RobotType>{robotName(robot.type)}</RobotType>
                    <RobotAttribute>
                        x =
                        <RobotInput {...{ index, robot, attribute: 'x', game }} />
                    </RobotAttribute>
                    <RobotAttribute>
                        y =
                        <RobotInput {...{ index, robot, attribute: 'y', game }} />
                    </RobotAttribute>
                    <RobotAttribute>
                        orientation =
                        <RobotInput {...{ index, robot, attribute: 'orientation', game }} />
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

function RobotInput({
    index,
    robot,
    attribute,
    game,
}: {
    index: number
    robot: Robot
    attribute: RobotAttribute
    game: Game
}): JSX.Element {
    return (
        <Input
            type="number"
            placeholder="0"
            onChange={(e) => {
                robot[attribute] = parseInt(e.target.value)
                game.updateRobot(index, robot)
            }}
        />
    )
}

export default Editor
