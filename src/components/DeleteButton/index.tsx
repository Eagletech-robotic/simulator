import { CrossIcon, StyledDeleteButton } from './styles'
import crossIcon from 'src/assets/cross-icon.svg'

const DeleteButton = ({ doDeletion }: { doDeletion: () => void }) => {
    return (
        <StyledDeleteButton onClick={doDeletion}>
            <CrossIcon src={crossIcon} alt="Delete" />
        </StyledDeleteButton>
    )
}

export default DeleteButton
