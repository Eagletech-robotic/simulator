import { Game } from 'src/models/Game'
import List from './List'
import RobotSelectors from './RobotSelectors'
import { RobotChooser } from './styles'
import { RightPanel } from 'src/styles/commonStyles'

interface EditorProps {
    game: Game
    editorElRef: React.RefObject<HTMLDivElement>
    gameChanged: () => void
}

const Editor = ({ game, editorElRef, gameChanged }: EditorProps): JSX.Element => {
    return (
        <RightPanel>
            <RobotChooser>
                <RobotSelectors color="blue" {...{ game, editorElRef, gameChanged }} />
                <RobotSelectors color="yellow" {...{ game, editorElRef, gameChanged }} />
            </RobotChooser>

            <List {...{ game, gameChanged }} ref={editorElRef} />
        </RightPanel>
    )
}

export default Editor
