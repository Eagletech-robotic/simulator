import { barLabelStyle, colors } from 'src/styles/commonStyles'
import styled from 'styled-components'

export const Container = styled.div`
    grid-area: gameDuration;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`

export const SliderInput = styled.input<{ seconds: number }>`
    position: relative;
    width: 100%;
    appearance: none;
    background-color: ${colors.darkGrey};
    height: 8px;
    border-radius: 4px;
    cursor: pointer;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        background: ${colors.blue};
        border-radius: 50%;
        transition: background-color 0.3s ease, transform 0.2s ease;

        &:hover {
            background: ${colors.blueHover};
        }
    }

    &::-moz-range-thumb {
        border: none;
        width: 16px;
        height: 16px;
        background: ${colors.blue};
        border-radius: 50%;
        transition: background-color 0.3s ease, transform 0.2s ease;

        &:hover {
            background: ${colors.blueHover};
        }
    }

    &:disabled {
        background-color: ${colors.lightGrey};
        cursor: default;

        &::-webkit-slider-thumb {
            background: ${colors.darkGrey};
        }

        &::-moz-range-thumb {
            background: ${colors.darkGrey};
        }
    }

    &::after {
        content: '${(props) => props.seconds} seconds';
        ${barLabelStyle}
    }

    &:disabled::after {
        color: ${colors.darkGrey};
    }
`

export const Label = styled.label`
    font-size: 0.8rem;
    width: 100%;
    text-align: center;
    padding-top: 0.4rem;
`
