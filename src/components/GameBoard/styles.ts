import styled from 'styled-components'

export const StyledGameBoardCanvas = styled.canvas`
    align-self: center;
    background-image: url('/playmat.png');
    background-repeat: no-repeat;
    background-size: cover;
    display: block;
    height: auto;
    max-height: 100%;
    max-width: 100%;
    min-height: 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
`