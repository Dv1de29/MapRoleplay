import { useGameStore } from '../store/GameStore';
import { requestAIMove } from '../ai-worker/aiService';
import { buildAIPrompt } from './AiPromptManager';

/**
 * Executes an AI turn for a specific empire.
 * Due to performance and synchronization constraints, this should ONLY be called by the Host.
 * @param empireId The ID of the NPC empire
 */
export async function executeAITurn(empireId: string) {
    const store = useGameStore.getState();
    const empire = store.empires[empireId];

    // Strictly enforce that only the Host computes AI logic
    if (!store.isHost) {
        console.warn("Non-host client attempted to execute AI turn. Ignoring to prevent desync.");
        return;
    }

    if (!empire || !empire.isAI) {
        return;
    }

    console.log(`[AI Engine] Starting turn for ${empire.name}...`);
    
    try {
        const prompt = buildAIPrompt(empireId);
        
        // Request the move from our Web Worker
        const responseText = await requestAIMove(prompt);
        console.log(`[AI Engine] Raw response for ${empire.name}:`, responseText);
        
        // Attempt to parse the LLM's JSON response
        try {
            // Sometimes LLMs wrap JSON in markdown blocks (e.g. ```json ... ```)
            // A simple cleanup regex to extract just the JSON
            const cleanJsonText = responseText.replace(/```json|```/g, '').trim();
            const action = JSON.parse(cleanJsonText);
            
            console.log(`[AI Engine] Parsed action:`, action);
            
            // TODO: Dispatch the parsed action back to GameStore (and broadcast over WebRTC)
            // Example:
            // if (action.action === 'FORM_ALLIANCE' && action.targetEmpireId) {
            //      store.setAlliance(empireId, action.targetEmpireId);
            // }

        } catch (e) {
            console.error(`[AI Engine] Failed to parse JSON response from LLM:`, responseText);
        }

    } catch (error) {
        console.error(`[AI Engine] Error during turn execution for ${empireId}:`, error);
    }
}
