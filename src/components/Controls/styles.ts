import styled from 'styled-components'

export const StyledControls = styled.div`
    display: grid;
    grid-template-columns: 3rem 1fr 4fr 4rem 3rem;
    grid-template-rows: 3rem;
    grid-template-areas: 'play gameDuration playbackProgress simulationProgress stop';

    gap: 1rem;
    padding: 1rem;
    align-items: center;
`

export const PlaybackBar = styled.div`
    grid-area: playbackProgress;
    position: relative;
    width: 100%;
`

export const SimulationBar = styled.div`
    grid-area: simulationProgress;
    position: relative;
    width: 100%;
`
