import { Container, ProgressBar, StateIndicator } from './styles'

interface SimulationProgressProps {
    progressPercentage: number
}

const SimulationProgress = ({ progressPercentage }: SimulationProgressProps): JSX.Element => {
    return (
        <Container>
            <ProgressBar progressPercentage={progressPercentage} />
            <StateIndicator>
                {progressPercentage == 0
                    ? ''
                    : progressPercentage == 100
                    ? 'Finished'
                    : 'Simulating...'}
            </StateIndicator>
        </Container>
    )
}

export default SimulationProgress
