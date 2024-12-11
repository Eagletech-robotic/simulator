import { Bar, BarProgress, Container, Label } from './styles'

interface ProgressBarProps {
    progressPercentage: number
    labelFunction: (progressPercentage: number) => string
}

const ProgressBar = ({ progressPercentage, labelFunction }: ProgressBarProps): JSX.Element => {
    return (
        <Container>
            <Bar>
                <BarProgress style={{ width: `${progressPercentage}%` }} />
            </Bar>
            <Label $visible={progressPercentage > 0}>{labelFunction(progressPercentage)}</Label>
        </Container>
    )
}

export default ProgressBar
