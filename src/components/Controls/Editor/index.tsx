import { Game } from 'src/models/Game'
import { EditRobot, Input, RobotAttribute, RobotType, StyledEditor } from './styles'
import React from 'react'
import DeleteButton from '../DeleteButton'
import { GenericRobot } from 'src/models/Robot'

type RobotAttributeType = 'x' | 'y' | 'orientation'

interface EditorProps {
    game: Game
    forceRefreshApp: () => void
}

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
    ({ game, forceRefreshApp }, ref): JSX.Element => {
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

                        <DeleteButton
                            doDeletion={() => {
                                game.deleteRobot(robot.id)
                                setTimeout(() => forceRefreshApp(), 0)
                            }}
                        />
                    </EditRobot>
                ))}
            </StyledEditor>
        )
    }
)

const robotName = (type: GenericRobot['type']) => {
    switch (type) {
        case 'controlled':
            return 'Main Robot'
        case 'sequential':
            return 'Pami'
    }
}

interface RobotInputProps {
    robot: GenericRobot
    attribute: RobotAttributeType
    game: Game
}

const RobotInput = ({ robot, attribute, game }: RobotInputProps): JSX.Element => {
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
