import { Game } from 'src/models/Game'
import { RightPanel } from 'src/styles/commonStyles'
import Robots from './Robots'
import Objects from './Objects'

interface EditorProps {
    game: Game
    editorElRef: React.RefObject<HTMLDivElement>
    gameChanged: () => void
}

const Editor = ({ game, editorElRef, gameChanged }: EditorProps): JSX.Element => {
    return (
        <RightPanel>
            <Robots {...{ game, editorElRef, gameChanged }} />
            <Objects {...{ game, gameChanged }} />
        </RightPanel>
    )
}

export default Editor
