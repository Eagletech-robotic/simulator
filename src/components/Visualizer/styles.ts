import { colors } from 'src/styles/commonStyles'
import styled, { css } from 'styled-components'

export const Header = styled.div`
    padding: 1rem;
    margin-bottom: 1rem;
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: 1fr;
    background-color: ${colors.lightGrey};
`

export const Body = styled.div`
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
`

export const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

export const BottomRow = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
`

export const RobotName = styled.div`
    text-align: center;
    align-content: center;
`

export const RobotTypeIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`

export const RobotColorIndicator = styled.div<{ color: 'yellow' | 'blue' }>`
    height: 1rem;
    width: 1rem;
    background-color: ${(props) => (props.color === 'yellow' ? colors.yellow : colors.blue)};
    border-radius: 50%;
`

export const RobotIcon = styled.img`
    width: 2rem;
    height: 2rem;
    user-select: none;
`

const switchRobotButton = css`
    border: none;
    border-radius: 8px;
    cursor: pointer;
    height: 2.5rem;
    width: 2.5rem;
    box-sizing: content-box;
    padding: 0.5rem;
    background-color: ${colors.lightGrey};

    &:hover {
        background-color: ${colors.lightGreyHover};
    }
`

export const PreviousRobotButton = styled.button`
    ${switchRobotButton}

    transform: rotate(180deg);
`

export const NextRobotButton = styled.button`
    ${switchRobotButton}
`

export const Info = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
`

export const InfoLabel = styled.div`
`

export const InfoValue = styled.div`
    font-size: 1.4rem;
    font-weight: 500;
    color: #212529;
    margin: 0;
`

export const SliderInput = styled.input`
`

export const Logs = styled.div`
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-height: 20rem;
    overflow-y: auto;
`

export const Log = styled.div<{ $level: 'info' | 'error' }>`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    background-color: ${props => props.$level === 'info' ? colors.lightGrey : "brown"};
    font-family: "Courier New", Courier, monospace;
`
