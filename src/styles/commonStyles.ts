import { createGlobalStyle, css } from 'styled-components'

export const colors = {
    blue: '#2196f3',
    yellow: '#ffeb3b',
    darkGrey: '#e0e0e0',
    darkGreyHover: '#d0d0d0',
}

const styles = css`
    body {
        font-family: 'Roboto', sans-serif;
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
