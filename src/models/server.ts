const SERVER_URL = 'http://localhost:8080'

async function fetchDataFromServer<I, O>(
    method: 'GET' | 'POST' = 'POST',
    path: `/${string}`,
    body?: I
): Promise<O> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    }

    if (method === 'POST') {
        options.body = JSON.stringify(body || {})
    }

    try {
        const response = await fetch(SERVER_URL + path, options)
        const body = await response.json()

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        return body
    } catch (error) {
        console.error('Failed to fetch data:', error)
        throw error
    }
}

export async function serverInit() {
    return fetchDataFromServer<never, void>('POST', '/init')
}

export async function serverStep(input: StepInput) {
    return fetchDataFromServer<StepInput, StepOutput>('POST', '/step', input)
}

export interface StepInput {
    encoder1: number
    encoder2: number
}

interface StepOutput {
    vitesse1_ratio: number
    vitesse2_ratio: number
    servo_pelle_ratio: number
}
