import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei'

const AnimatedSphere = () => {
    const meshRef = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        meshRef.current.rotation.x = t * 0.2
        meshRef.current.rotation.y = t * 0.3
    })

    return (
        <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
            <MeshDistortMaterial
                color="#ef4444"
                attach="material"
                distort={0.5}
                speed={2}
                roughness={0}
            />
        </Sphere>
    )
}

export default function HomeAnimation() {
    return (
        <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <OrbitControls enableZoom={false} />
                <ambientLight intensity={1} />
                <directionalLight position={[2, 1, 1]} />
                <AnimatedSphere />
            </Canvas>
        </div>
    )
}