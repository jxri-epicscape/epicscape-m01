import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as THREE from 'three';
import type { Card } from '../types';

interface ARStatuePuzzleProps {
  card: Card;
  onComplete: (cardId: string) => void;
}

export function ARStatuePuzzle({ card, onComplete }: ARStatuePuzzleProps) {
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isARActive, setIsARActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  const mindARRef = useRef<any>(null);
  const mindarInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Check if AR is supported and load MindAR
    const checkARSupport = async () => {
      try {
        // Check if we have camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsARSupported(false);
          setArError('Camera access not available');
          setIsLoading(false);
          return;
        }

        // Check if WebGL is supported
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setIsARSupported(false);
          setArError('WebGL not supported');
          setIsLoading(false);
          return;
        }

        // Try to load MindAR
        try {
          console.log('Loading MindAR...');
          const mindARModule = await import('mind-ar/dist/mindar-image-three.prod.js');
          mindARRef.current = mindARModule.MindARThree;
          console.log('MindAR loaded successfully');
          setIsARSupported(true);
        } catch (error) {
          console.warn('MindAR not available, using fallback mode:', error);
          setIsARSupported(true); // Still allow the component to work
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking AR support:', error);
        setIsARSupported(false);
        setArError('AR not supported on this device');
        setIsLoading(false);
      }
    };

    checkARSupport();
  }, []);

  // Initialize MindAR when AR becomes active and container is available
  useEffect(() => {
    if (isARActive && mindARRef.current && card.arTargetSrc) {
      // Use a small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        initializeMindAR();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isARActive, card.arTargetSrc]);

  const createTextTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    // Clear canvas with transparent background
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set text properties
    context.font = 'bold 80px Arial';
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add text with stroke for better visibility
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create and return texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const handleStartAR = async () => {
    try {
      console.log('Starting AR experience...');
      
      // Simply activate AR - let MindAR handle camera access internally
      setIsARActive(true);
      
    } catch (error) {
      console.error('Error starting AR:', error);
      setArError('Failed to start AR experience');
    }
  };

  const initializeMindAR = async () => {
    try {
      const container = document.getElementById('ar-container');
      if (!container || !mindARRef.current) {
        console.error('Container or MindAR not available');
        return;
      }

      console.log('Container found, initializing MindAR instance...');

      // Clean up any existing instance
      if (mindarInstanceRef.current) {
        try {
          console.log('Stopping previous MindAR instance...');
          await mindarInstanceRef.current.stop();
        } catch (e) {
          console.warn('Error stopping previous MindAR instance:', e);
        }
      }

      // Set container dimensions explicitly
      container.style.width = '100%';
      container.style.height = '100%';

      // Initialize MindAR with proper constructor
      const MindARThreeClass = mindARRef.current;
      console.log('Creating new MindAR instance with target:', card.arTargetSrc);
      
      const mindarThree = new MindARThreeClass({
        container: container,
        imageTargetSrc: card.arTargetSrc,
        maxTrack: 1,
        warmupTolerance: 5,
        missTolerance: 5,
        filterMinCF: card.arFilterMinCF || 0.001,
        filterBeta: card.arFilterBeta || 0.001,
      });

      mindarInstanceRef.current = mindarThree;
      console.log('MindAR instance created');

      const { renderer, scene, camera } = mindarThree;
      
      // Ensure renderer fills the container properly
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.objectFit = 'cover';

      // Add AR content when target is found
      const anchor = mindarThree.addAnchor(0);
      
      // Create text texture
      const textTexture = createTextTexture('COOL');
      
      if (textTexture) {
        // Create material with text texture
        const material = new THREE.MeshBasicMaterial({
          map: textTexture,
          transparent: true,
          side: THREE.DoubleSide
        });
        
        // Create geometry for the text plane
        const geometry = new THREE.PlaneGeometry(1, 0.5);
        const textMesh = new THREE.Mesh(geometry, material);
        
        // Position the text slightly forward so it's visible
        textMesh.position.z = 0.1;
        
        anchor.group.add(textMesh);
      }

      // Handle target found
      anchor.onTargetFound = () => {
        console.log('AR target detected!');
        handleTargetFound();
      };

      // Start AR - this will handle camera access internally
      console.log('Starting MindAR...');
      await mindarThree.start();
      console.log('MindAR started successfully');
      
    } catch (error) {
      console.error('Error initializing MindAR:', error);
      setArError('Failed to initialize AR. Using fallback mode.');
      // Fallback to manual completion
    }
  };

  const handleTargetFound = () => {
    console.log('AR target detected!');
    setShowSuccess(true);
    setIsARActive(false);
    
    // Complete the puzzle after showing success message
    setTimeout(() => {
      onComplete(card.id);
    }, 2000);
  };

  const handleManualComplete = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete(card.id);
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mindarInstanceRef.current) {
        try {
          const stopResult = mindarInstanceRef.current.stop();
          if (stopResult && typeof stopResult.catch === 'function') {
            stopResult.catch(console.warn);
          }
        } catch (error) {
          console.warn('Error during AR cleanup:', error);
        }
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl text-white font-light text-center">
          {card.title || 'AR Puzzle'}
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white/80">Checking AR support...</p>
        </div>
      </div>
    );
  }

  if (!isARSupported || arError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl text-white font-light text-center">
          {card.title || 'AR Puzzle'}
        </h2>
        
        <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-300" />
            <p className="text-yellow-300 font-medium">AR Not Available</p>
          </div>
          <p className="text-yellow-200 mb-4">
            {arError || 'AR functionality is not supported on this device.'}
          </p>
          <p className="text-yellow-200 text-sm">
            This puzzle requires camera access and WebGL support. You can still complete the puzzle manually.
          </p>
        </div>

        {card.question && (
          <p className="text-white/80 text-center">
            {card.question}
          </p>
        )}

        <button
          onClick={handleManualComplete}
          className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Complete AR Puzzle
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl text-white font-light text-center">
          {card.title || 'AR Puzzle'}
        </h2>
        
        <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <p className="text-green-400 font-medium">AR Target Detected!</p>
          </div>
          <p className="text-green-300">
            {card.successText || 'You have successfully detected the AR target and revealed the hidden content!'}
          </p>
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <p className="text-white text-center text-2xl font-bold">
              Hidden Content: COOL
            </p>
          </div>
        </div>

        {card.pinCodeViesti && (
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <p className="text-lg text-blue-300 text-center leading-relaxed">
              {card.pinCodeViesti}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isARActive) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl text-white font-light text-center">
          {card.title || 'AR Puzzle'}
        </h2>

        {/* AR Viewer Container */}
        <div className="relative w-full pb-[56.25%] bg-black rounded-xl overflow-hidden">
          {/* MindAR will render here */}
          <div 
            id="ar-container" 
            className="absolute inset-0 w-full h-full z-10"
            style={{ background: 'transparent' }}
          />
          
          {/* Fallback content if MindAR doesn't load */}
          {!mindARRef.current && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center">
                <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-white/80 mb-2">AR Camera Active</p>
                <p className="text-white/60 text-sm">
                  Point your camera at the target image
                </p>
                
                {/* Simulate AR detection for demo */}
                <button
                  onClick={handleTargetFound}
                  className="mt-4 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm"
                >
                  Simulate Target Detection (Demo)
                </button>
              </div>
            </div>
          )}

          {/* AR Target Overlay */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-30">
            Investigating the scene...
          </div>
        </div>

        <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <p className="text-blue-300 text-sm text-center">
            <strong>Instructions:</strong> Point your camera at the target image to reveal the hidden content. Make sure you have good lighting and hold your device steady.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-white font-light text-center">
        {card.title || 'AR Puzzle'}
      </h2>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-white" />
          <p className="text-white font-medium">AR Ready</p>
        </div>
        {card.question && (
          <p className="text-white/90">
            {card.question}
          </p>
        )}
      </div>

      <button
        onClick={handleStartAR}
        className="w-full bg-white/20 text-white rounded-xl px-5 py-3 backdrop-blur-md ring-1 ring-white/20 hover:bg-white/25 transform button-hover-scale flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
        Start AR Experience
      </button>

      <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
        <p className="text-blue-300 text-sm text-center">
          <strong>Instructions:</strong> Look for the target image in your environment. When found, point your camera at it to reveal the hidden AR content.
        </p>
      </div>
    </div>
  );
}