import { Bar, BarProgress, Container, Label } from './styles'

interface ProgressBarProps {
    percentage: number
    setPercentage?: (percentage: number) => void
    labelFunction: (progressPercentage: number) => string
}

const ProgressBar = ({ percentage, setPercentage, labelFunction }: ProgressBarProps): JSX.Element => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!setPercentage) return
        const barWidth = e.currentTarget.clientWidth
        const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left
        let newPercentage = (clickX / barWidth) * 100
        newPercentage = newPercentage < 0 ? 0 : newPercentage > 100 ? 100 : newPercentage
        setPercentage(newPercentage)
    }

    return (
        <Container>
            <Bar $clickable={!!setPercentage} onClick={handleClick}>
                <BarProgress style={{ width: `${percentage}%` }} />
            </Bar>
            <Label $visible={percentage > 0}>{labelFunction(percentage)}</Label>
        </Container>
    )
}

export default ProgressBar
