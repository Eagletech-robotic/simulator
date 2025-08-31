import styled from 'styled-components'

export const Page = styled.div`
    display: grid;
    grid-template-columns: 1fr 40rem;
    grid-column-gap: 2rem;
    height: 100vh;
    overflow: hidden;
    padding: 2rem;
`

export const BoardAndControls = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    min-height: 0;
`
