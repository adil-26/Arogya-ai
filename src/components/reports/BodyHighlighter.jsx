'use client';
import React from 'react';
import ThreeDBodyMap from '@/components/BodyMap/3D/ThreeDBodyMap';

// Mapping from AI "affected_locations" (specific) to 3D Model "names" (generic)
const LOCATION_MAP = {
    'brain': 'head',
    'skull': 'head',
    'neck': 'head', // Closest
    'spine_cervical': 'head', // Neck area
    'chest': 'chest',
    'heart': 'chest',
    'lungs': 'chest',
    'spine_thoracic': 'chest',
    'abdomen': 'abdomen',
    'liver': 'abdomen',
    'kidney': 'abdomen',
    'spine_lumbar': 'abdomen',
    'pelvis': 'pelvis',
    'hips': 'pelvis',
    'arm_left': 'left_arm',
    'arm_right': 'right_arm',
    'leg_left': 'left_leg',
    'knee_left': 'left_leg',
    'foot_left': 'left_leg',
    'leg_right': 'right_leg',
    'knee_right': 'right_leg',
    'foot_right': 'right_leg'
};

const BodyHighlighter = ({ findings }) => {
    // findings: ["spine_lumbar", "nerve_sciatic"]

    // Convert specific findings to generic 3D model parts
    const highlightedParts = findings?.map(f => LOCATION_MAP[f] || f) || [];
    // Remove duplicates
    const uniqueParts = [...new Set(highlightedParts)];

    return (
        <div className="w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-white">
                <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Affected Areas</h4>
                <ul className="text-xs space-y-1">
                    {findings?.length > 0 ? findings.map(f => (
                        <li key={f}>• {f.replace('_', ' ')}</li>
                    )) : <li>No specific areas localized</li>}
                </ul>
            </div>

            {/* Pass array directly to ThreeDBodyMap -> HumanoidModel */}
            {/* Note: We need to ensure ThreeDBodyMap passes 'selectedPart' prop down even if it's an array */}
            <ThreeDBodyMap selectedPartOverride={uniqueParts} />
        </div>
    );
};

export default BodyHighlighter;
