import { CrossIcon, StyledDeleteButton } from './styles'
import crossIcon from 'src/assets/cross-icon.svg'

const DeleteButton = ({ doDeletion }: { doDeletion: () => void }): JSX.Element => {
    return (
        <StyledDeleteButton onClick={doDeletion}>
            <CrossIcon src={crossIcon} alt="Delete" />
        </StyledDeleteButton>
    )
}

export default DeleteButton
