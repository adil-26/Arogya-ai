'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Heart Model
const Heart = ({ pulse, color }) => {
    const meshRef = useRef();
    const materialRef = useRef();

    useFrame((state) => {
        if (meshRef.current && pulse) {
            // Heartbeat animation - scale pulse
            const time = state.clock.getElapsedTime();
            const beat = Math.sin(time * 4) * 0.1 + 1;
            const secondBeat = Math.sin(time * 4 + 0.3) * 0.05;
            meshRef.current.scale.setScalar(beat + secondBeat);

            // Glow intensity animation
            if (materialRef.current) {
                materialRef.current.emissiveIntensity = 0.3 + Math.sin(time * 4) * 0.2;
            }
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                color={color || '#EF4444'}
                emissive={color || '#EF4444'}
                emissiveIntensity={0.3}
                roughness={0.3}
                metalness={0.5}
            />
        </mesh>
    );
};

// ECG Line Animation
const ECGLine = ({ color = '#EF4444' }) => {
    const lineRef = useRef();
    const pointsRef = useRef([]);

    // Generate ECG waveform points
    useEffect(() => {
        const points = [];
        for (let i = 0; i < 50; i++) {
            points.push(new THREE.Vector3(i * 0.1 - 2.5, 0, 0));
        }
        pointsRef.current = points;
    }, []);

    useFrame((state) => {
        if (lineRef.current && pointsRef.current.length > 0) {
            const time = state.clock.getElapsedTime();
            const positions = lineRef.current.geometry.attributes.position;

            for (let i = 0; i < 50; i++) {
                const t = (i + time * 10) % 50;
                let y = 0;

                // ECG waveform pattern
                if (t > 15 && t < 17) y = Math.sin((t - 15) * Math.PI) * 0.2;
                if (t > 20 && t < 22) y = -Math.sin((t - 20) * Math.PI * 2) * 0.15;
                if (t > 22 && t < 25) y = Math.sin((t - 22) * Math.PI) * 0.6; // R peak
                if (t > 25 && t < 27) y = -Math.sin((t - 25) * Math.PI) * 0.2;
                if (t > 30 && t < 35) y = Math.sin((t - 30) * Math.PI) * 0.15;

                positions.setY(i, y);
            }
            positions.needsUpdate = true;
        }
    });

    return (
        <line ref={lineRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={50}
                    array={new Float32Array(150)}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color={color} linewidth={2} />
        </line>
    );
};

// Main Heartbeat Canvas Component
const HeartbeatAnimation = ({
    bpm = 72,
    status = 'normal',
    size = 60,
    showECG = false
}) => {
    const getColor = () => {
        switch (status) {
            case 'critical': return '#DC2626';
            case 'high': return '#F59E0B';
            case 'low': return '#3B82F6';
            case 'normal':
            default: return '#10B981';
        }
    };

    return (
        <div style={{ width: size, height: size }}>
            <Canvas
                camera={{ position: [0, 0, 3], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Heart pulse={true} color={getColor()} />
                {showECG && <ECGLine color={getColor()} />}
            </Canvas>
        </div>
    );
};

export default HeartbeatAnimation;
