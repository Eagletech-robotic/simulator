import {
    BlueColorIndicator,
    ColorContainer,
    Controls,
    GameBoard,
    Page,
    PieceChooser,
    YellowColorIndicator,
} from './AppStyles'
import PieceSelector from './components/PieceSelector'
import { GlobalStyles } from './styles/commonStyles'

import RobotIcon from './assets/robot-icon.svg'
import PamiIcon from './assets/pami-icon.svg'

export default function App() {
    return (
        <>
            <GlobalStyles />

            <Page>
                <GameBoard />
                <Controls>
                    <PieceChooser>
                        <ColorContainer>
                            <PieceSelector pieceIconSrc={RobotIcon} />
                            <BlueColorIndicator />
                            <PieceSelector pieceIconSrc={PamiIcon} />
                        </ColorContainer>
                        <ColorContainer>
                            <PieceSelector pieceIconSrc={RobotIcon} />
                            <YellowColorIndicator />
                            <PieceSelector pieceIconSrc={PamiIcon} />
                        </ColorContainer>
                    </PieceChooser>
                </Controls>
            </Page>
        </>
    )
}
