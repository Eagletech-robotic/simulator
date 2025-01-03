import { Game } from 'src/models/Game'
import List from './List'
import RobotSelectors from './RobotSelectors'
import { RobotChooser } from './styles'
import { RightPanel } from 'src/styles/commonStyles'

interface EditorProps {
    game: Game
    editorElRef: React.RefObject<HTMLDivElement>
    stepChanged: () => void
}

const Editor = ({ game, editorElRef, stepChanged }: EditorProps): JSX.Element => {
    return (
        <RightPanel>
            <RobotChooser>
                <RobotSelectors color="blue" {...{ game, editorElRef, stepChanged }} />
                <RobotSelectors color="yellow" {...{ game, editorElRef, stepChanged }} />
            </RobotChooser>

            <List {...{ game, stepChanged }} ref={editorElRef} />
        </RightPanel>
    )
}

export default Editor
