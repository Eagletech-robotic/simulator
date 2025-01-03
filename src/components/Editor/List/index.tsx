import { EditRobot, Input, RobotAttribute, RobotType, StyledList } from './styles'
import React from 'react'
import DeleteButton from '../DeleteButton'
import { GenericRobot } from 'src/models/GenericRobot'
import { Game } from 'src/models/Game'

interface EditorProps {
    game: Game
    stepChanged: () => void
}

const List = React.forwardRef<HTMLDivElement, EditorProps>(
    ({ game, stepChanged }, ref): JSX.Element => {
        return (
            <StyledList ref={ref}>
                {game.robots.map((robot) => (
                    <EditRobot key={robot.id} color={robot.color}>
                        <RobotType>{robot.displayName}</RobotType>
                        <RobotAttribute>
                            x =
                            <RobotInput {...{ robot, attribute: 'x', game, stepChanged }} />
                        </RobotAttribute>
                        <RobotAttribute>
                            y =
                            <RobotInput {...{ robot, attribute: 'y', game, stepChanged }} />
                        </RobotAttribute>
                        <RobotAttribute>
                            orientation (deg) =
                            <RobotInput
                                {...{ robot, attribute: 'orientationDeg', game, stepChanged }}
                            />
                        </RobotAttribute>

                        <DeleteButton
                            doDeletion={() => {
                                game.deleteRobot(robot.id)
                                setTimeout(() => stepChanged(), 0)
                            }}
                        />
                    </EditRobot>
                ))}
            </StyledList>
        )
    }
)

interface RobotInputProps {
    robot: GenericRobot
    attribute: 'x' | 'y' | 'orientationDeg'
    game: Game
    stepChanged: () => void
}

const RobotInput = ({ robot, attribute, game, stepChanged }: RobotInputProps): JSX.Element => {
    const value =
        attribute === 'orientationDeg' ? robot.orientationInDegrees() : robot.lastStep[attribute]

    return (
        <Input
            type="number"
            placeholder="0"
            value={value}
            onChange={(e) => {
                const value = parseInt(e.target.value)
                if (attribute === 'orientationDeg') {
                    robot.setOrientationInDegrees(value)
                } else {
                    robot.lastStep[attribute] = value
                }
                game.updateRobot(robot.id, robot)
                stepChanged()
            }}
        />
    )
}

export default List
