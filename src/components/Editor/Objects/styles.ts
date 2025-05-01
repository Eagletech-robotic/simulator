import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    justify-content: space-evenly;
    padding: 1rem;
    background-color: ${colors.lightGrey};
`

export const Button = styled.button`
    background-color: ${colors.blue};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;

    &:hover {
        background-color: ${colors.blueHover};
    }
    
    &:disabled {
        background-color: ${colors.darkGrey};
        color: white;
        cursor: not-allowed;
    }
`
