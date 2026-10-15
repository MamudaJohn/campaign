import React, { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// HDR bloom only affects bright surfaces; the output pass preserves material contrast.
export default function CinematicEffects() {
  const { gl, scene, camera, size, viewport } = useThree();
  const effect = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true });
    target.samples = 2;
    const composer = new EffectComposer(gl, target);
    const render = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .36, .45, 1.05);
    const output = new OutputPass();
    composer.addPass(render); composer.addPass(bloom); composer.addPass(output);
    return { composer, render, bloom, output };
  }, [gl, scene, camera]);
  useEffect(() => { effect.composer.setPixelRatio(viewport.dpr); effect.composer.setSize(size.width, size.height); }, [effect, size.width, size.height, viewport.dpr]);
  useEffect(() => () => { effect.bloom.dispose(); effect.output.dispose(); effect.render.dispose(); effect.composer.dispose(); }, [effect]);
  useFrame((_, delta) => effect.composer.render(delta), 1);
  return null;
}
