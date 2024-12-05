import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const StyledPlayButton = styled.button`
    background-color: ${colors.darkGrey};
    border: none;
    height: 100%;
    width: 5rem;
    border-radius: 1rem;
    cursor: pointer;

    &:hover {
        background-color: ${colors.darkGreyHover};
    }
`
