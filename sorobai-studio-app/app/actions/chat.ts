'use server';

interface ChatRequest {
    query: string;
    mode?: string;
    k?: number;
    temperature?: number;
    stream?: boolean;
    code_only?: boolean;
    language?: string;
}

interface ChatResponse {
    answer: string;
    sources: Array<{
        file: string;
        section: string;
        has_code: boolean;
        score: number;
    }>;
    context_used: number;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    console.log('Sending chat message with request:', request);
    const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: request.query,
            mode: request.mode || 'code',
            k: request.k || 5,
            temperature: request.temperature || 0.1,
            stream: request.stream || false,
            code_only: request.code_only || false,
            language: request.language || null,
        }),
    });

    if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
    }

    return response.json();
}
