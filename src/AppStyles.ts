import styled from 'styled-components'
import { colors } from './styles/commonStyles'

export const Page = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 1rem;
    height: 100vh;
    overflow: hidden;
`

export const StepEditor = styled.div`
    display: grid;
    grid-template-rows: 6rem 1fr;
    overflow: hidden;
    background-color: ${colors.lightGrey};
    margin: 2rem;
    border-radius: 1rem;
`

export const RobotChooser = styled.div`
    display: flex;
    justify-content: space-evenly;
    padding: 1rem;
    background-color: #e0e0e0;
    border-radius: 1rem;
`

export const ControlButtons = styled.div`
    display: grid;
    grid-template-columns: 3rem 1fr 4fr 4rem 3rem;
    grid-template-rows: 3rem;
    grid-template-areas: 'play gameDuration progress simulationProgress stop';

    gap: 1rem;
    padding: 1rem;
    align-items: center;
`
