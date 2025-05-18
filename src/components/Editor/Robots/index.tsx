import { Game } from 'src/models/Game'
import List from './List'
import RobotSelectors from './RobotSelectors'
import { RobotChooser } from './styles'

interface RobotsProps {
    game: Game
    editorElRef: React.RefObject<HTMLDivElement>
    gameChanged: () => void
    setSelectedRobotId: React.Dispatch<React.SetStateAction<number | null>>
}

const Robots = ({ game, editorElRef, gameChanged, setSelectedRobotId }: RobotsProps): JSX.Element => {
    return (
        <>
            <RobotChooser>
                <RobotSelectors color="blue" {...{ game, editorElRef, gameChanged }} />
                <RobotSelectors color="yellow" {...{ game, editorElRef, gameChanged }} />
            </RobotChooser>

            <List {...{ game, gameChanged, setSelectedRobotId }} ref={editorElRef} />
        </>
    )
}

export default Robots
