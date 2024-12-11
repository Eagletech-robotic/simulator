import styled from "styled-components";
import { colors } from "../../styles/commonStyles";

export const StyledEditor = styled.div`
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
