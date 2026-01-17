import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import HumanoidModel from './HumanoidModel';
import { Scan, RotateCw, Maximize2 } from 'lucide-react';

const ThreeDBodyMap = ({ onOrganSelect }) => {
    const [selectedPart, setSelectedPart] = useState(null);

    const handlePartClick = (partName) => {
        setSelectedPart(partName);
        if (onOrganSelect) onOrganSelect(partName);
    };

    return (
        <div style={{
            width: '100%',
            height: '600px',
            background: '#020617', // Dark sci-fi background
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #1e293b',
            boxShadow: 'inset 0 0 50px rgba(0, 240, 255, 0.05)'
        }}>
            {/* Sci-Fi Overlay UI */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ color: '#00f0ff', fontFamily: 'monospace', fontSize: '12px', border: '1px solid rgba(0,240,255,0.3)', padding: '5px 10px', display: 'inline-block' }}>
                    SYSTEM: ONLINE
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '5px' }}>
                    BIO-SCANNER V.3.0
                </div>
            </div>

            {/* Right Side Data Panel Placeholder */}
            <div style={{
                position: 'absolute', top: 20, right: 20, zIndex: 10, width: '200px',
                pointerEvents: 'none' // Let clicks pass through to canvas
            }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', justifyContent: 'flex-end' }}>
                    <div style={{ height: '4px', width: '20px', background: '#00f0ff' }}></div>
                    <div style={{ height: '4px', width: '4px', background: '#00f0ff' }}></div>
                    <div style={{ height: '4px', width: '4px', background: '#00f0ff' }}></div>
                </div>
                {selectedPart ? (
                    <div style={{
                        background: 'rgba(0, 10, 20, 0.8)',
                        border: '1px solid rgba(0, 240, 255, 0.5)',
                        padding: '15px',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        fontFamily: 'monospace'
                    }}>
                        <div style={{ color: '#00f0ff', fontSize: '14px', marginBottom: '5px', borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: '5px' }}>
                            ANALYSIS: {selectedPart.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                            &gt; STRUCTURAL INTEGRITY: 100%<br />
                            &gt; INFLAMMATION: NONE<br />
                            &gt; HISTORY: NO RECENT TRAUMA
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'right', color: 'rgba(0,240,255,0.5)', fontSize: '10px', fontFamily: 'monospace' }}>
                        WAITING FOR TARGET SELECTION...
                    </div>
                )}
            </div>

            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00cc" />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Grid args={[20, 20]} cellSize={1} cellThickness={0.5} cellColor="#1e293b" sectionSize={5} sectionThickness={1} sectionColor="#00f0ff" fadeDistance={20} position={[0, -4, 0]} />

                    <HumanoidModel onPartClick={handlePartClick} selectedPart={selectedPart} />

                    <OrbitControls
                        enablePan={false}
                        minDistance={4}
                        maxDistance={12}
                        autoRotate={!selectedPart}
                        autoRotateSpeed={0.5}
                    />
                </Suspense>
            </Canvas>

            {/* Bottom Controls */}
            <div style={{
                position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, display: 'flex', gap: '20px'
            }}>
                <button style={{
                    background: 'rgba(0,240,255,0.1)', border: '1px solid #00f0ff', color: '#00f0ff',
                    padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setSelectedPart(null)} title="Scanning Mode">
                    <Scan size={20} />
                </button>
            </div>
        </div>
    );
};

export default ThreeDBodyMap;
