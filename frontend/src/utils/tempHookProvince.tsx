// src/hooks/useAdjacencyDebugger.ts
import { useEffect } from 'react';
import adjacencies from '../data/maps/Vic_Europe_neib.json';

export function useAdjacencyDebugger(selectedProvince: string | null) {
    useEffect(() => {
        // 1. Reset all borders back to normal first
        const allPaths = document.querySelectorAll('path');
        allPaths.forEach(path => {
            path.setAttribute('stroke', '#000000');
            path.setAttribute('stroke-width', '0.4');
        });

        if (!selectedProvince) return;

        // 2. Highlight the province you actually clicked (White)
        const clickedElement = document.getElementById(selectedProvince);
        if (clickedElement) {
            clickedElement.setAttribute('stroke', '#ffffff');
            clickedElement.setAttribute('stroke-width', '1.5');
        }

        // 3. Find the neighbors from our JSON
        const neighbors = (adjacencies as Record<string, string[]>)[selectedProvince] || [];

        // 4. Paint the neighbors Neon Green!
        neighbors.forEach(neighborId => {
            const neighborElement = document.getElementById(neighborId);
            if (neighborElement) {
                neighborElement.setAttribute('stroke', '#39ff14');
                neighborElement.setAttribute('stroke-width', '2.0');
            } else {
                // This warns you if the JSON neighbor doesn't match the SVG ID!
                console.warn(`⚠️ Debugger: Neighbor "${neighborId}" not found in SVG!`);
            }
        });

    }, [selectedProvince]);
}