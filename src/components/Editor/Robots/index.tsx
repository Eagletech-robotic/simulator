import { Game } from 'src/models/Game'
import List from './List'
import RobotSelectors from './RobotSelectors'
import { RobotChooser } from './styles'

interface RobotsProps {
    game: Game
    editorElRef: React.RefObject<HTMLDivElement>
    gameChanged: () => void
}

const Robots = ({ game, editorElRef, gameChanged }: RobotsProps): JSX.Element => {
    return (
        <>
            <RobotChooser>
                <RobotSelectors color="blue" {...{ game, editorElRef, gameChanged }} />
                <RobotSelectors color="yellow" {...{ game, editorElRef, gameChanged }} />
            </RobotChooser>

            <List {...{ game, gameChanged }} ref={editorElRef} />
        </>
    )
}

export default Robots
