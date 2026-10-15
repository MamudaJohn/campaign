import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { createCityLayout, PLAZA_LEVEL } from './city-layout.mjs';
import { createFacadeTextures, createPlazaTextures } from './materials';

const BLUE = '#387cff', GOLD = '#ffce56';
const BLUE_LIGHT = new THREE.Color(BLUE).multiplyScalar(6);
const GOLD_LIGHT = new THREE.Color(GOLD).multiplyScalar(2.5);

function Tower({ tower, facade }) {
  const { x, z, width, height, depth, variant, crown, beacon } = tower;
  const detailed = z > -30;
  return <group position={[x, PLAZA_LEVEL, z]}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]}/>
      <meshPhysicalMaterial color="#9ba7bc" map={facade.map} emissiveMap={facade.emissiveMap} emissive="#ffffff" emissiveIntensity={1.55} metalness={.65} roughness={.3} clearcoat={.65} clearcoatRoughness={.2} envMapIntensity={.8}/>
    </mesh>
    {detailed && <>{[-1, 1].map(side => <mesh key={side} position={[side * width * .49, height / 2, depth * .515]} castShadow><boxGeometry args={[.12, height, .13]}/><meshStandardMaterial color="#29384b" metalness={.85} roughness={.25}/></mesh>)}
    <mesh position={[0, .55, depth * .51]} castShadow><boxGeometry args={[width * .9, .6, .5]}/><meshStandardMaterial color="#101a29" metalness={.6} roughness={.35}/></mesh>
    <mesh position={[0, .95, depth * .59]}><boxGeometry args={[width * .8, .025, .08]}/><meshBasicMaterial color={variant % 2 ? GOLD_LIGHT : BLUE_LIGHT} toneMapped={false}/></mesh></>}
    <mesh position={[0, height + .06, 0]} castShadow receiveShadow><boxGeometry args={[width + .15, .12, depth + .15]}/><meshStandardMaterial color="#1c2a3c" metalness={.75} roughness={.35}/></mesh>
    {crown && <group><mesh position={[0, height + .65, 0]} castShadow><boxGeometry args={[width * .68, 1.2, depth * .7]}/><meshStandardMaterial color="#192a40" metalness={.7} roughness={.3}/></mesh><mesh position={[0, height + 1.28, 0]}><boxGeometry args={[width * .7, .035, depth * .72]}/><meshBasicMaterial color={variant % 2 ? GOLD_LIGHT : BLUE_LIGHT} toneMapped={false}/></mesh></group>}
    {detailed && <mesh position={[width * .25, height + .25, -.5]} castShadow><boxGeometry args={[.65, .45, .75]}/><meshStandardMaterial color="#344252" metalness={.75} roughness={.5}/></mesh>}
    {beacon && <group position={[-width * .24, height + .1, 0]}><mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[.025, .05, 2, 5]}/><meshStandardMaterial color="#455469" metalness={.8} roughness={.3}/></mesh><mesh position={[0, 2, 0]}><sphereGeometry args={[.075, 8, 8]}/><meshBasicMaterial color="#ff845f" toneMapped={false}/></mesh></group>}
    {height > 18 && <mesh position={[-width * .5 - .015, height * .65, depth * .32]}><boxGeometry args={[.025, height * .35, .055]}/><meshBasicMaterial color={variant % 2 ? GOLD_LIGHT : BLUE_LIGHT} toneMapped={false}/></mesh>}
  </group>;
}

function Skyline() {
  const buildings = useMemo(createCityLayout, []);
  const facades = useMemo(() => [0, 1, 2, 3].map(createFacadeTextures), []);
  useEffect(() => () => facades.forEach(facade => { facade.map.dispose(); facade.emissiveMap.dispose(); }), [facades]);
  return <group>{buildings.map(tower => <Tower key={tower.id} tower={tower} facade={facades[tower.variant]}/>)}</group>;
}

function Plaza({ cinematic }) {
  const textures = useMemo(createPlazaTextures, []);
  const normalScale = useMemo(() => new THREE.Vector2(.12, .12), []);
  useEffect(() => () => Object.values(textures).forEach(texture => texture.dispose()), [textures]);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLAZA_LEVEL, -16]} receiveShadow>
      <planeGeometry args={[180, 180]}/>
      {cinematic ? <MeshReflectorMaterial resolution={512} blur={[240, 80]} mixBlur={.7} mixStrength={1.1} mirror={.35} depthScale={.4} minDepthThreshold={.6} maxDepthThreshold={1.5} color="#19283d" metalness={.7} roughness={.32} roughnessMap={textures.roughnessMap} normalMap={textures.normalMap} normalScale={normalScale} reflectorOffset={.015}/> : <meshStandardMaterial color="#111e31" metalness={.65} roughness={.32} roughnessMap={textures.roughnessMap} normalMap={textures.normalMap} normalScale={normalScale}/>} 
    </mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * 7, PLAZA_LEVEL + .08, -18]} receiveShadow castShadow><boxGeometry args={[.3, .16, 85]}/><meshStandardMaterial color="#253047" metalness={.55} roughness={.55}/></mesh>
      <mesh position={[side * 6.82, PLAZA_LEVEL + .13, -18]}><boxGeometry args={[.028, .035, 85]}/><meshBasicMaterial color={side < 0 ? BLUE : '#d9b252'} toneMapped={false}/></mesh>
      {Array.from({ length: 15 }, (_, index) => <mesh key={index} position={[side * 5.8, PLAZA_LEVEL + .012, 8 - index * 4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.055, 1.5]}/><meshBasicMaterial color="#748299" transparent opacity={.6}/></mesh>)}
    </group>)}
    {Array.from({ length: 16 }, (_, index) => <mesh key={index} position={[0, PLAZA_LEVEL + .009, 15 - index * 5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[13.5, .012]}/><meshBasicMaterial color="#354761" transparent opacity={.45}/></mesh>)}
  </group>;
}

function StreetFixtures() {
  return <group>{[-1, 1].flatMap(side => [2, -8, -20, -34].map((z, index) => <group key={`${side}-${z}`} position={[side * 7.4, PLAZA_LEVEL, z]}>
    <mesh position={[0, 1.8, 0]} castShadow><cylinderGeometry args={[.055, .095, 3.6, 8]}/><meshStandardMaterial color="#19263a" metalness={.85} roughness={.3}/></mesh>
    <mesh position={[-side * .35, 3.55, 0]} castShadow><boxGeometry args={[.85, .07, .3]}/><meshStandardMaterial color="#253a53" metalness={.8} roughness={.25}/></mesh>
    <mesh position={[-side * .35, 3.51, 0]}><boxGeometry args={[.68, .018, .22]}/><meshBasicMaterial color={side < 0 ? '#b7d7ff' : '#ffe1a2'} toneMapped={false}/></mesh>
    {index === 0 && <pointLight position={[-side * .35, 3.2, 0]} color={side < 0 ? '#b7d7ff' : '#ffe1a2'} intensity={22} distance={11} decay={2}/>}
  </group>))}</group>;
}

function Skybridges() {
  return <group>{[-1, 1].map(side => <group key={side} position={[side * 13.2, 3.2, -13]}>
    <mesh castShadow receiveShadow><boxGeometry args={[8, .35, 2]}/><meshStandardMaterial color="#26374e" metalness={.8} roughness={.3}/></mesh>
    <mesh position={[0, .6, 0]}><boxGeometry args={[8, 1.1, 1.8]}/><meshPhysicalMaterial color="#35628c" metalness={.2} roughness={.12} transparent opacity={.3} depthWrite={false}/></mesh>
    {[-1, 1].map(edge => <mesh key={edge} position={[0, .08, edge * .97]}><boxGeometry args={[8, .035, .035]}/><meshBasicMaterial color={side < 0 ? BLUE : GOLD} toneMapped={false}/></mesh>)}
    <mesh position={[0, 1.2, 0]} castShadow><boxGeometry args={[8.2, .1, 2.1]}/><meshStandardMaterial color="#1b2a40" metalness={.8} roughness={.3}/></mesh>
  </group>)}</group>;
}

function AirVehicle({ index, motion }) {
  const ref = useRef(), time = useRef(index * 13.4);
  const direction = index % 2 ? -1 : 1;
  useFrame((_, delta) => {
    if (motion) time.current += Math.min(delta, .05);
    const x = (time.current * (1.25 + index * .13) % 75 - 37.5) * direction;
    ref.current.position.set(x, 6 + (index % 4) * 2.1 + Math.sin(time.current * .4) * .15, -15 - (index % 3) * 8);
    ref.current.rotation.set(0, direction > 0 ? 0 : Math.PI, Math.sin(time.current * .3) * .015);
  });
  return <group ref={ref} scale={.55}>
    <mesh castShadow><boxGeometry args={[1.5, .24, .7]}/><meshPhysicalMaterial color="#223852" metalness={.85} roughness={.22} clearcoat={1}/></mesh>
    <mesh position={[-.1, .2, 0]}><boxGeometry args={[.7, .2, .55]}/><meshPhysicalMaterial color="#11263c" metalness={.4} roughness={.08} clearcoat={1}/></mesh>
    <mesh position={[0, -.12, 0]}><boxGeometry args={[1, .025, .6]}/><meshBasicMaterial color={BLUE} toneMapped={false}/></mesh>
    {[-1, 1].map(side => <group key={side}><mesh position={[.77, .01, side * .23]}><boxGeometry args={[.035, .065, .16]}/><meshBasicMaterial color="#cde9ff" toneMapped={false}/></mesh><mesh position={[-.78, .01, side * .23]}><boxGeometry args={[.035, .05, .16]}/><meshBasicMaterial color={GOLD} toneMapped={false}/></mesh><mesh position={[-1.4, 0, side * .23]}><boxGeometry args={[1.15, .014, .014]}/><meshBasicMaterial color={BLUE} transparent opacity={.25} toneMapped={false}/></mesh></group>)}
  </group>;
}

function SweepLight({ side, motion, cinematic }) {
  const light = useRef(), time = useRef(side < 0 ? 1 : 5);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, delta) => {
    if (motion) time.current += Math.min(delta, .05);
    target.position.set(side * (2 + Math.sin(time.current * .18) * 5), PLAZA_LEVEL, -4 + Math.cos(time.current * .14) * 7);
    target.updateMatrixWorld();
  });
  return <><primitive object={target}/><SpotLight ref={light} target={target} position={[side * 8.5, 10, -7]} color={side < 0 ? '#89baff' : '#ffe0a0'} intensity={130} distance={38} angle={.2} penumbra={.85} decay={2} castShadow={false} volumetric={cinematic} opacity={.1} attenuation={30} anglePower={4} radiusTop={.035} radiusBottom={2.5}/></>;
}

function CitySky({ motion }) {
  const ref = useRef(), time = useRef(0);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, delta) => { if (motion) { time.current += Math.min(delta, .05); ref.current.uniforms.uTime.value = time.current; } });
  return <mesh position={[0, 30, -100]}><planeGeometry args={[260, 150]}/><shaderMaterial ref={ref} depthWrite={false} uniforms={uniforms} vertexShader="varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}" fragmentShader={`varying vec2 vUv; uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec2 uv=vUv;float cloud=0.;vec2 p=uv*vec2(6.,12.)+vec2(uTime*.003,0.);float amplitude=.5;for(int i=0;i<4;i++){cloud+=noise(p)*amplitude;p*=2.03;amplitude*=.5;}vec3 sky=mix(vec3(.025,.045,.09),vec3(.003,.008,.025),uv.y);sky+=vec3(.035,.06,.1)*smoothstep(.35,.8,cloud)*(1.-uv.y);float glow=exp(-length((uv-vec2(.47,.28))*vec2(3.,4.))*6.);sky+=vec3(.02,.035,.08)*glow;gl_FragColor=vec4(sky,1.);}`}/></mesh>;
}

export default function TechCity({ motion, cinematic }) {
  return <>
    <Environment frames={1} resolution={128} environmentIntensity={.7}>
      <Lightformer form="rect" position={[0, 12, -5]} rotation={[Math.PI / 2, 0, 0]} scale={[18, 8, 1]} color="#c1d5f5" intensity={2.5}/>
      <Lightformer form="rect" position={[-12, 3, 2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 12, 1]} color={BLUE} intensity={3}/>
      <Lightformer form="rect" position={[12, 4, -3]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 10, 1]} color="#ffe0aa" intensity={2}/>
    </Environment>
    <CitySky motion={motion}/><Skyline/><Plaza cinematic={cinematic}/><StreetFixtures/><Skybridges/>
    {[-1, 1].map(side => <SweepLight key={side} side={side} motion={motion} cinematic={cinematic}/>)}
    {Array.from({ length: 6 }, (_, index) => <AirVehicle key={index} index={index} motion={motion}/>)}
  </>;
}
