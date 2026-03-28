import { useEffect, useState } from 'react';
import { useGameStore } from '../store/GameStore';
import { createPortal } from 'react-dom';
import { getArmyShow } from '../types/MapTypes';

interface ArmyMarkerProps {
    armyId: string;
}

export default function ArmyMarker({ armyId }: ArmyMarkerProps) {
    const army = useGameStore(state => state.armies[armyId]);
    const empireColor = useGameStore(state => state.getEmpireColor(army?.owner || ''));

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [mapSvg, setMapSvg] = useState<Element | null>(null);

    useEffect(() => {
        if (!army) return;

        const provinceElement = document.getElementById(army.location) as SVGGraphicsElement | null;

        if (provinceElement) {
            const bbox = provinceElement.getBBox();
            const centerX = bbox.x + (bbox.width / 2);
            const centerY = bbox.y + (bbox.height / 2);

            setPosition({ x: centerX, y: centerY });

            const targetSvg = document.getElementById('map-group') || document.querySelector('.svg-map-wrapper svg');
            setMapSvg(targetSvg);
        }
    }, [army?.location]);

    if (!army || position.x === 0 || !mapSvg) return null;

    const { form, number } = getArmyShow(army);

    return createPortal(
        <g style={{ transition: 'all 0.5s ease-in-out' }}>
            <circle
                cx={position.x}
                cy={position.y}
                r="1.5"
                fill={empireColor}
                stroke="#ffffff"
                strokeWidth="0.5"
                style={{ pointerEvents: 'none' }}
            />
            <text
                x={position.x}
                y={position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#000000" // Black text usually reads better on colored circles
                fontSize="1.5"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
            >
                {/* Rely on pure state properties, not methods! */}
                {number}
            </text>
        </g>,
        mapSvg
    );
}