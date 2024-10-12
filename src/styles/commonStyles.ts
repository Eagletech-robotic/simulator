import styled, { createGlobalStyle, css } from 'styled-components'

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
