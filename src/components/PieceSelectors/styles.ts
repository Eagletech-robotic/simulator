import styled, { css } from 'styled-components'

export const ColorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 25%;
    position: relative;
`

export const ColorIndicator = styled.div<{color: 'blue' | 'yellow'}>`
    position: absolute;
    bottom: -1rem;
    height: 4px;
    width: 100%;
    background-color: ${(props) => (props.color === 'blue' ? '#0000ff' : '#fff000')};
`
