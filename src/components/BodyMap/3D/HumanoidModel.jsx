import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

// Holographic Material for that Sci-Fi Look
const HolographicMaterial = ({ color = "#00f0ff", selected = false }) => {
    return (
        <meshStandardMaterial
            color={selected ? "#ff0000" : color}
            emissive={selected ? "#ff0000" : color}
            emissiveIntensity={selected ? 2 : 0.5}
            transparent
            opacity={0.6}
            wireframe={true} // Sci-fi wireframe look
        />
    );
};

const BodyPart = ({ position, args, type, name, onClick, selectedPart }) => {
    const isSelected = selectedPart === name;

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick(name); }}>
            {type === 'sphere' && (
                <Sphere args={args}>
                    <HolographicMaterial selected={isSelected} />
                </Sphere>
            )}
            {type === 'cylinder' && (
                <Cylinder args={args}>
                    <HolographicMaterial selected={isSelected} />
                </Cylinder>
            )}
            {/* Floating Label for selected part */}
            {isSelected && (
                <Html position={[1.5, 0, 0]}>
                    <div style={{
                        background: 'rgba(0, 20, 40, 0.8)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        padding: '10px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        width: '150px'
                    }}>
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>SCANNING...</div>
                        <div style={{ fontWeight: 'bold' }}>{name.toUpperCase()}</div>
                    </div>
                </Html>
            )}
        </group>
    );
};

export default function HumanoidModel({ onPartClick, selectedPart }) {
    const group = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Gentle "breathing" or float animation
        group.current.position.y = Math.sin(t / 2) * 0.1;
        group.current.rotation.y = Math.sin(t / 4) * 0.1;
    });

    return (
        <group ref={group} position={[0, -2, 0]}> {/* Adjust scan centering */}

            {/* HEAD */}
            <BodyPart position={[0, 4.2, 0]} args={[0.5, 16, 16]} type="sphere" name="head" onClick={onPartClick} selectedPart={selectedPart} />

            {/* NECK */}
            <BodyPart position={[0, 3.5, 0]} args={[0.2, 0.2, 0.6, 16]} type="cylinder" name="head" onClick={onPartClick} selectedPart={selectedPart} />

            {/* TORSO / CHEST */}
            <BodyPart position={[0, 2.5, 0]} args={[0.7, 0.5, 1.5, 16]} type="cylinder" name="chest" onClick={onPartClick} selectedPart={selectedPart} />

            {/* ABDOMEN */}
            <BodyPart position={[0, 1.3, 0]} args={[0.5, 0.5, 1.2, 16]} type="cylinder" name="abdomen" onClick={onPartClick} selectedPart={selectedPart} />

            {/* PELVIS - approximated as sphere */}
            <BodyPart position={[0, 0.4, 0]} args={[0.55, 16, 16]} type="sphere" name="pelvis" onClick={onPartClick} selectedPart={selectedPart} />

            {/* --- ARMS --- */}
            {/* Left Shoulder */}
            <BodyPart position={[-0.9, 3, 0]} args={[0.3, 16, 16]} type="sphere" name="left_arm" onClick={onPartClick} selectedPart={selectedPart} />
            {/* Left Arm Upper */}
            <BodyPart position={[-0.9, 2.2, 0]} args={[0.15, 0.15, 1.2, 8]} type="cylinder" name="left_arm" onClick={onPartClick} selectedPart={selectedPart} />
            {/* Right Shoulder */}
            <BodyPart position={[0.9, 3, 0]} args={[0.3, 16, 16]} type="sphere" name="right_arm" onClick={onPartClick} selectedPart={selectedPart} />
            {/* Right Arm Upper */}
            <BodyPart position={[0.9, 2.2, 0]} args={[0.15, 0.15, 1.2, 8]} type="cylinder" name="right_arm" onClick={onPartClick} selectedPart={selectedPart} />

            {/* --- LEGS --- */}
            {/* Left Leg Upper */}
            <BodyPart position={[-0.4, -0.8, 0]} args={[0.2, 0.15, 1.8, 8]} type="cylinder" name="left_leg" onClick={onPartClick} selectedPart={selectedPart} />
            {/* Left Leg Lower */}
            <BodyPart position={[-0.4, -2.5, 0]} args={[0.15, 0.12, 1.6, 8]} type="cylinder" name="left_leg" onClick={onPartClick} selectedPart={selectedPart} />

            {/* Right Leg Upper */}
            <BodyPart position={[0.4, -0.8, 0]} args={[0.2, 0.15, 1.8, 8]} type="cylinder" name="right_leg" onClick={onPartClick} selectedPart={selectedPart} />
            {/* Right Leg Lower */}
            <BodyPart position={[0.4, -2.5, 0]} args={[0.15, 0.12, 1.6, 8]} type="cylinder" name="right_leg" onClick={onPartClick} selectedPart={selectedPart} />

        </group>
    );
}
