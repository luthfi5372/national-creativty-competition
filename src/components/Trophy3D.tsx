"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function TrophyMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
    
    // Mouse parallax effect for the whole group
    if (groupRef.current) {
      const targetX = state.mouse.x * 0.5;
      const targetY = state.mouse.y * 0.5;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.1;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 0]} />
          <MeshTransmissionMaterial
            backside
            samples={3} // Reduced from 4 for better performance
            resolution={512}
            thickness={0.5}
            chromaticAberration={0.5}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.5}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            clearcoat={1}
            roughness={0.1}
            metalness={0.1}
            color="#a78bfa"
          />
          {/* Inner core to make it look like a trophy/atom */}
          <mesh>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial color="#22d3ee" wireframe />
          </mesh>
        </mesh>
      </Float>
    </group>
  );
}

export default function Trophy3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center translate-y-10 group/trophy">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6d28d9" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
        
        {/* Environment map for realistic glass reflections */}
        <Environment preset="city" />
        
        <TrophyMesh />
      </Canvas>
    </div>
  );
}
