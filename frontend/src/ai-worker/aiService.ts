import { CreateWebWorkerMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';

let engine: MLCEngineInterface | null = null;
const DEFAULT_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

/**
 * Initializes the WebLLM engine inside a background Web Worker.
 * @param progressCallback Callback to update the UI with loading progress
 * @returns The initialized MLCEngine interface
 */
export async function initAI(progressCallback: (progress: any) => void): Promise<MLCEngineInterface> {
    if (engine) return engine;

    // Uses Vite's built-in worker implementation
    const worker = new Worker(new URL('./llmWorker.ts', import.meta.url), { type: 'module' });

    engine = await CreateWebWorkerMLCEngine(
        worker,
        DEFAULT_MODEL,
        { initProgressCallback: progressCallback }
    );

    return engine;
}

/**
 * Sends a prompt to the background AI worker and waits for the response.
 * @param prompt The system/user prompt defining the AI's allowed actions
 * @returns The text response containing the AI's decided action
 */
export async function requestAIMove(prompt: string): Promise<string> {
    if (!engine) {
        throw new Error("AI Engine not initialized. Call initAI() first.");
    }

    const reply = await engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        // We enforce a small max_tokens limit to discourage the LLM from writing huge essays,
        // since we only need a deterministic structured move.
        max_tokens: 512,
    });

    return reply.choices[0].message.content || "";
}

/**
 * Optional function to terminate the web worker if needed
 */
export function terminateAI() {
    if (engine) {
        // Engine internally uses the Web Worker so we can't directly worker.terminate() here 
        // unless we retain a reference to it, but @mlc-ai engine has its own destruction method if needed.
        engine.unload();
        engine = null;
    }
}
