import { EditRobot, Input, RobotAttribute, RobotType, StyledEditor } from './styles'
import React from 'react'
import DeleteButton from '../DeleteButton'
import { GenericRobot } from 'src/models/Robot'
import { Step } from 'src/models/Step'

interface EditorProps {
    step: Step
    stepChanged: () => void
}

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
    ({ step, stepChanged }, ref): JSX.Element => {
        return (
            <StyledEditor ref={ref}>
                {step.robots.map((robot) => (
                    <EditRobot key={robot.id} color={robot.color}>
                        <RobotType>{robotName(robot.type)}</RobotType>
                        <RobotAttribute>
                            x =
                            <RobotInput {...{ robot, attribute: 'x', step, stepChanged }} />
                        </RobotAttribute>
                        <RobotAttribute>
                            y =
                            <RobotInput {...{ robot, attribute: 'y', step, stepChanged }} />
                        </RobotAttribute>
                        <RobotAttribute>
                            orientation (deg) =
                            <RobotInput
                                {...{ robot, attribute: 'orientationDeg', step, stepChanged }}
                            />
                        </RobotAttribute>

                        <DeleteButton
                            doDeletion={() => {
                                step.deleteRobot(robot.id)
                                setTimeout(() => stepChanged(), 0)
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
    step: Step
    stepChanged: () => void
}

const RobotInput = ({ robot, attribute, step, stepChanged }: RobotInputProps): JSX.Element => {
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
                step.updateRobot(robot.id, robot)
                stepChanged()
            }}
        />
    )
}

export default Editor
