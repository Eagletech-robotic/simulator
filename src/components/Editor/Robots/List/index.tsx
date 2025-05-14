import { EditRobot, Input, RobotAttribute, RobotType, StyledList } from './styles'
import React from 'react'
import DeleteButton from '../DeleteButton'
import { Game } from 'src/models/Game'
import { Robot } from 'src/models/robot/Robot'

interface EditorProps {
    game: Game
    gameChanged: () => void
}

const List = React.forwardRef<HTMLDivElement, EditorProps>(
    ({ game, gameChanged }, ref): JSX.Element => {
        return (
            <StyledList ref={ref}>
                {game.robots.map((robot) => (
                    <EditRobot key={robot.id} color={robot.color}>
                        <RobotType>{robot.displayName}</RobotType>
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
                                {...{ robot, attribute: 'orientationDeg', game, gameChanged, step: 1 }}
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
            </StyledList>
        )
    },
)

interface RobotInputProps {
    robot: Robot
    attribute: 'x' | 'y' | 'orientationDeg'
    game: Game
    gameChanged: () => void
    step?: number
}

const RobotInput = ({ robot, attribute, game, gameChanged, step = 0.01 }: RobotInputProps): JSX.Element => {
    const value =
        attribute === 'orientationDeg' ? robot.orientationInDegrees() : robot.lastStep[attribute]

    return (
        <Input
            type="number"
            step={step}
            value={value}
            onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (attribute === 'orientationDeg') {
                    robot.setOrientationInDegrees(value)
                } else {
                    robot.lastStep[attribute] = value
                }
                game.updateRobot(robot.id, robot)
                gameChanged()
            }}
        />
    )
}

export default List
