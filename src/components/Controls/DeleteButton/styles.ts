import { colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const StyledDeleteButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    padding: 1.5rem;
    border: none;
    background-color: ${colors.darkGrey};

    &:hover {
        background-color: ${colors.darkGreyHover};
    }
`

export const CrossIcon = styled.img`
    height: 1rem;
    width: 1rem;
`
