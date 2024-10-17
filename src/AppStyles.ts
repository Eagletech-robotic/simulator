import styled, { css } from 'styled-components'

export const Page = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 1rem;
    height: 100vh;
`

export const GameBoard = styled.div`
    height: 100%;
    background-color: #f0f0f0;
`

export const Controls = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #f0f0f0;
    margin: 2rem;
    border-radius: 1rem;
`

export const PieceChooser = styled.div`
    display: flex;
    justify-content: space-evenly;
    padding: 1rem;
    background-color: #e0e0e0;
    border-radius: 1rem;
`
