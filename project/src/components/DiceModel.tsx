import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { DiceFace } from '../types';

interface DiceModelProps {
  diceFaces?: DiceFace[];
}

export function DiceModel({ diceFaces }: DiceModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diceRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x: 0, y: 0 });

  // Default dice faces if none provided
  const defaultDiceFaces: DiceFace[] = [
    { text1: 'xxx', text2: 'yyy', bgColor: '#74ed11', textColor: '#000000' }, // Right - Green
    { text1: 'Cookies', text2: 'Dog', bgColor: '#2f55d4', textColor: '#000000' }, // Left - Blue
    { text1: 'Hot Dog', text2: 'Bird', bgColor: '#ed071e', textColor: '#000000' }, // Top - Red
    { text1: 'Juice', text2: 'Snake', bgColor: '#e2ed11', textColor: '#000000' }, // Bottom - Yellow
    { text1: 'Cake', text2: 'Tiger', bgColor: '#11edd3', textColor: '#000000' }, // Front - Cyan
    { text1: 'Ice Cream', text2: 'Fish', bgColor: '#e01fb3', textColor: '#000000' }  // Back - Pink
  ];

  const facesToUse = diceFaces && diceFaces.length === 6 ? diceFaces : defaultDiceFaces;

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create textures for each face using the provided or default data
    const createTextTexture = (face: DiceFace) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      
      if (!context) return null;

      // Background
      context.fillStyle = face.bgColor;
      context.fillRect(0, 0, 256, 256);

      // Text
      context.fillStyle = face.textColor;
      context.font = 'bold 35px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Calculate vertical positions for two lines
      const lineHeight = 40;
      const centerY = canvas.height / 2;
      const firstLineY = centerY - lineHeight;
      const secondLineY = centerY + lineHeight;

      context.fillText(face.text1, 128, firstLineY);
      context.fillText(face.text2, 128, secondLineY);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Create materials with text and colors from the faces data
    const materials = facesToUse.map(face => 
      new THREE.MeshBasicMaterial({ map: createTextTexture(face) })
    );

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create dice
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const dice = new THREE.Mesh(geometry, materials);
    scene.add(dice);
    diceRef.current = dice;

    // Animation loop
    const animate = () => {
      if (!dice || !renderer || !scene || !camera) return;
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Initial render
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      renderer.dispose();
      materials.forEach(material => material.dispose());
      geometry.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [facesToUse]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    setPreviousPosition(pos);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !diceRef.current) return;

    const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    const deltaMove = {
      x: pos.x - previousPosition.x,
      y: pos.y - previousPosition.y
    };

    const rotationSpeed = 0.01;
    diceRef.current.rotation.y += deltaMove.x * rotationSpeed;
    diceRef.current.rotation.x += deltaMove.y * rotationSpeed;

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    setPreviousPosition(pos);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef} 
      className="w-[300px] h-[300px] mx-auto bg-transparent cursor-move touch-none select-none"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    />
  );
}