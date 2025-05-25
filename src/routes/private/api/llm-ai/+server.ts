// src/private/api/llm-ai/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';

/**
 * @description Handles POST requests to the LLM-AI endpoint, forwarding prompts to the Ollama API and streaming responses back to the client.
 *
 * @param {Object} context - SvelteKit request event context.
 * @param {Request} context.request - The incoming request object containing the prompt and other parameters.
 * @param {Locals} context.locals - SvelteKit locals object containing the Supabase client for user authentication.
 *
 * @returns {Promise<Response>} A promise that resolves to a Response object.  If `stream` is true, the response is a streaming response with `Content-Type: application/jsonl`.
 * If `stream` is false, the response is a JSON response containing the complete AI response.
 *
 * @throws {Error} Will throw an error if:
 * - The user is not authenticated (401).
 * - The prompt is missing (400).
 * - There is an error communicating with the Ollama API (propagates Ollama's status code).
 * - The Ollama API returns an empty response body (500).
 * - There is a general error during the AI response fetching process (500).
 *
 * @example
 * ```typescript
 * // Example request body:
 * {
 *   "prompt": "Write a short poem about the stars.",
 *   "model": "gemma:7b",
 *   "stream": true
 * }
 * ```
 *
 * @remarks
 * - Authenticates the user via Supabase.
 * - Forwards the prompt to the Ollama API, using the specified model or a default model if none is provided.
 * - Handles both streaming and non-streaming responses from the Ollama API.
 * - Filters out `<think>` tags from the AI response, which are often used by reasoning models.
 * - Uses `application/jsonl` for streaming responses, sending line-delimited JSON objects.
 * - Includes error handling for authentication, missing prompts, and Ollama API errors.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    // Authenticate the user - essential for secure API calls
    const supabase = locals.supabase;
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw error(401, 'Unauthorized: User not logged in.');
    }

    // 1. Get ALL parameters from the client request body
    const requestBody = await request.json();
    const prompt = requestBody.prompt; // This is the complete, pre-constructed prompt from the client
    const model = requestBody.model || 'gemma3:12b'; // Use client's model or default
    const stream = typeof requestBody.stream === 'boolean' ? requestBody.stream : true; // Use client's stream setting or default to true

    if (!prompt) {
        throw error(400, 'Prompt is required.');
    }

    try {
        // 2. Forward to Ollama API
        console.log(`Server: Sending request to Ollama for user ${user.id} with model ${model}, stream: ${stream}`);
        const ollamaResponse = await fetch(OLLAMA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt, // Use the prompt as sent by the client
                stream: stream // Use the stream setting from the client
            })
        });

        if (!ollamaResponse.body) {
            throw error(500, 'No response body from Ollama.');
        }

        if (!ollamaResponse.ok) {
            const ollamaErrorText = await ollamaResponse.text();
            console.error('Server: Error from Ollama:', ollamaErrorText);
            throw error(ollamaResponse.status, `Ollama API error: ${ollamaErrorText}`);
        }

        // 3. Handle streaming response back to the client
        if (stream) {
            const customReadable = new ReadableStream({
                async start(controller) {
                    const reader = ollamaResponse.body!.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        buffer += chunk;

                        let lines = buffer.split('\n');
                        buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

                        for (const line of lines) {
                            if (!line.trim()) continue;
                            try {
                                const data = JSON.parse(line);
                                if (data.response) {
                                    // Filter out <think> (Usually for Reasoning Model like Deepseek-R1) tags on the server
                                    let text = data.response.replace(/<think>[\s\S]*?<\/think>/gi, '');
                                    controller.enqueue(new TextEncoder().encode(JSON.stringify({ chunk: text }) + '\n'));
                                }
                            } catch (e) {
                                // Ignore parse errors for incomplete lines or non-JSON lines
                                console.warn('Server: JSON parse error in stream line:', line, e);
                            }
                        }
                    }
                    // Handle any remaining buffer content
                    if (buffer.trim()) {
                         try {
                            const data = JSON.parse(buffer);
                            if (data.response) {
                                let text = data.response.replace(/<think>[\s\S]*?<\/think>/gi, '');
                                controller.enqueue(new TextEncoder().encode(JSON.stringify({ chunk: text }) + '\n'));
                            }
                        } catch (e) {
                            console.warn('Server: JSON parse error in final buffer:', buffer, e);
                        }
                    }
                    controller.close();
                },
                cancel(reason) {
                    console.log('Server: Stream cancelled:', reason);
                }
            });

            return new Response(customReadable, {
                headers: {
                    'Content-Type': 'application/jsonl', // Line-delimited JSON
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }
            });
        } else {
            // Handle non-streaming response if stream is false
            const ollamaData = await ollamaResponse.json();
            let finalResponse = ollamaData.response || ''; // Adjust based on Ollama's non-streaming response
            finalResponse = finalResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');
            return json({ aiResponse: finalResponse });
        }

    } catch (e: any) {
        console.error('Server: General error getting AI response:', e.message);
        throw error(e.status || 500, `Failed to fetch AI response: ${e.message}`);
    }
};