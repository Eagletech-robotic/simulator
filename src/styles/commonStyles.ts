import styled, { createGlobalStyle, css } from 'styled-components'

export const colors = {
    blue: '#2196f3',
    blueHover: '#0056b3',
    yellow: '#ffeb3b',
    darkGrey: '#e0e0e0',
    darkGreyHover: '#d0d0d0',
    lightGrey: '#f0f0f0',
}

const styles = css`
    body {
        font-family: 'Roboto', sans-serif;

        * {
            transition: 0.2s cubic-bezier(0.12, 0.64, 0.58, 1);
        }
    }

    h1 {
        color: #333;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.2;
    }

    p {
        color: #555;
        font-size: 1rem;
        line-height: 1.5;
    }
`

export const GlobalStyles = createGlobalStyle`${styles}`

export const RightPanel = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 2rem;
    border-radius: 1rem;
    background-color: ${colors.lightGrey};
`

export const playbackButtonStyle = css`
    padding: 0.5rem;
    border: none;
    height: 100%;
    width: 100%;
    border-radius: 1rem;
    cursor: pointer;
    user-select: none;
`

export const barLabelStyle = css`
    font-size: 0.8rem;
    position: absolute;
    color: #000;
    top: 1.2rem;
    width: 100%;
    text-align: center;
`

export const Icon = styled.img`
    width: 100%;
    height: 100%;
`
