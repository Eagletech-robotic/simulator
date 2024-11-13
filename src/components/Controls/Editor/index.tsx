import { Game } from 'src/models/Game'
import { EditRobot, Input, RobotAttribute, RobotType, StyledEditor } from './styles'
import React from 'react'
import DeleteButton from '../DeleteButton'
import { GenericRobot } from 'src/models/Robot'

interface EditorProps {
    game: Game
    gameChanged: () => void
}

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
    ({ game, gameChanged }, ref): JSX.Element => {
        return (
            <StyledEditor ref={ref}>
                {game.robots.map((robot) => (
                    <EditRobot key={robot.id} color={robot.color}>
                        <RobotType>{robotName(robot.type)}</RobotType>
                        <RobotAttribute>
                            x =
                            <RobotInput {...{ robot, attribute: 'x', game, gameChanged }} />
                        </RobotAttribute>
                        <RobotAttribute>
                            y =
                            <RobotInput {...{ robot, attribute: 'y', game, gameChanged }} />
                        </RobotAttribute>
                        <RobotAttribute>
                            orientation (deg) =
                            <RobotInput
                                {...{ robot, attribute: 'orientationDeg', game, gameChanged }}
                            />
                        </RobotAttribute>

                        <DeleteButton
                            doDeletion={() => {
                                game.deleteRobot(robot.id)
                                setTimeout(() => gameChanged(), 0)
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
    attribute: 'x' | 'y' | 'orientationDeg'
    game: Game
    gameChanged: () => void
}

const RobotInput = ({ robot, attribute, game, gameChanged }: RobotInputProps): JSX.Element => {
    return (
        <Input
            type="number"
            placeholder="0"
            onChange={(e) => {
                const value = parseInt(e.target.value)
                switch (attribute) {
                    case 'x':
                        robot.setX(value)
                        break
                    case 'y':
                        robot.setY(value)
                        break
                    case 'orientationDeg':
                        robot.setOrientationFromDegrees(value)
                        break
                }
                game.updateRobot(robot.id, robot)
                gameChanged()
            }}
        />
    )
}

export default Editor
