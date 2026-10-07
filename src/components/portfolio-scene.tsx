"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ScrollControls, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const waypoints = [new THREE.Vector3(0, 0, 8), new THREE.Vector3(2.5, -1, 7), new THREE.Vector3(-2, 1, 6), new THREE.Vector3(1, -2, 7), new THREE.Vector3(0, 0, 9)];

function GeometryField() {
  const group = useRef<THREE.Group>(null);
  const instances = useRef<THREE.InstancedMesh>(null);
  const mouse = useRef(new THREE.Vector2());
  const lastScroll = useRef(0);
  const velocity = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const transforms = useMemo(() => Array.from({ length: 48 }, (_, index) => ({
    position: new THREE.Vector3(Math.sin(index * 12.989) * 8, Math.cos(index * 7.33) * 6, -4 - (index % 9) * 1.35),
    rotation: new THREE.Euler(index * .31, index * .73, index * .17),
    scale: .09 + (index % 5) * .045,
  })), []);

  useEffect(() => { const move = (event: PointerEvent) => mouse.current.set(event.clientX / innerWidth - .5, event.clientY / innerHeight - .5); addEventListener("pointermove", move, { passive: true }); return () => removeEventListener("pointermove", move); }, []);
  useEffect(() => { if (!instances.current) return; transforms.forEach((item, index) => { dummy.position.copy(item.position); dummy.rotation.copy(item.rotation); dummy.scale.setScalar(item.scale); dummy.updateMatrix(); instances.current?.setMatrixAt(index, dummy.matrix); }); instances.current.instanceMatrix.needsUpdate = true; }, [dummy, transforms]);
  useFrame((state, delta) => { const progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); velocity.current = THREE.MathUtils.lerp(velocity.current, Math.abs(scrollY - lastScroll.current) / Math.max(1, delta * 1000), .08); lastScroll.current = scrollY; const scaled = progress * (waypoints.length - 1); const index = Math.min(waypoints.length - 2, Math.floor(scaled)); const cameraTarget = waypoints[index].clone().lerp(waypoints[index + 1], scaled - index); cameraTarget.x += mouse.current.x * .9; cameraTarget.y -= mouse.current.y * .65; state.camera.position.lerp(cameraTarget, .045); state.camera.lookAt(0, 0, 0); if (group.current) { group.current.rotation.x += delta * (.06 + velocity.current * .2); group.current.rotation.y += delta * (.1 + velocity.current * .35); } });
  return <group ref={group} position={[2.3, 0, 0]}><Float speed={1.2} rotationIntensity={.35} floatIntensity={.7}><mesh><icosahedronGeometry args={[2.15, 2]} /><meshStandardMaterial color="#111111" metalness={.92} roughness={.1} /></mesh><mesh scale={1.15}><torusKnotGeometry args={[2.3, .045, 192, 18]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3.2} toneMapped={false} /></mesh><mesh rotation={[1.2, .3, .5]}><torusGeometry args={[3, .018, 8, 220]} /><meshBasicMaterial color="#ffffff" transparent opacity={.32} /></mesh></Float><instancedMesh ref={instances} args={[undefined, undefined, transforms.length]}><tetrahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#777777" emissive="#ffffff" emissiveIntensity={.08} metalness={.82} roughness={.18} /></instancedMesh></group>;
}

export function PortfolioScene() { return <Canvas dpr={[1, 1.65]} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ position: [0, 0, 8], fov: 42 }}><color attach="background" args={["#050505"]} /><fog attach="fog" args={["#050505", 9, 24]} /><ambientLight intensity={.3} /><directionalLight position={[4, 5, 5]} intensity={2.6} color="#ffffff" /><pointLight position={[-4, -2, 3]} intensity={9} color="#bdbdbd" /><Stars radius={45} depth={24} count={1100} factor={1.4} saturation={0} fade speed={.25} /><ScrollControls pages={5} enabled={false}><GeometryField /></ScrollControls><EffectComposer multisampling={0}><Bloom intensity={.8} luminanceThreshold={.78} luminanceSmoothing={.2} mipmapBlur /><Vignette eskil={false} offset={.18} darkness={.78} /></EffectComposer></Canvas>; }
