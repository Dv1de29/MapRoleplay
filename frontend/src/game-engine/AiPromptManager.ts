import { useGameStore } from '../store/GameStore';

/**
 * Builds a contextual prompt for the WebLLM based on the current game state.
 * @param empireId The ID of the NPC empire taking its turn
 */
export function buildAIPrompt(empireId: string): string {
    const store = useGameStore.getState();
    const empire = store.empires[empireId];
    
    if (!empire) return "";

    const pop = store.getTotalPopulation(empireId);
    const arable = store.getAverageArableLand(empireId);
    const allies = store.getAlliances(empireId) || [];
    
    // Map ally IDs to readable names for the LLM
    const allyNames = allies.length > 0 
        ? allies.map(id => store.empires[id]?.name || id).join(', ') 
        : 'None';

    const prompt = `You are the supreme leader of ${empire.name}.
Your empire currently has a total population of ${pop} and an average arable land value of ${arable.toFixed(2)}.
Your current allies are: ${allyNames}.

Based on your current situation, decide your next strategic action. 
Respond ONLY in valid JSON format with the following structure:
{
  "action": "DECLARE_WAR" | "FORM_ALLIANCE" | "PASS",
  "targetEmpireId": "empire_id_here" (or null if PASS)
}
Do not include any other text or markdown formatting outside of the JSON block.`;

    return prompt;
}
