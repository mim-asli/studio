
"use client";

import React, { useRef, useEffect, useCallback, memo } from 'react';
import * as THREE from 'three';

interface GlobeDisplayProps {
    locations: string[];
    onLocationClick: (location: string) => void;
}

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
};


const GlobeDisplayComponent = ({ locations, onLocationClick }: GlobeDisplayProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const sphereRef = useRef<THREE.Mesh>();
    const locationGroupRef = useRef<THREE.Group>();
    
    // Memoize location coordinates to avoid recalculating
    const locationCoordsRef = useRef<Map<string, { lat: number, lon: number }>>(new Map());

    const generatePseudoRandom = useCallback(() => {
        let seed = 1;
        const a = 1664525;
        const c = 1013904223;
        const m = 2**32;
        return (str: string) => {
            for(let i = 0; i < str.length; i++) {
                seed = (a * (seed + str.charCodeAt(i)) + c) % m;
            }
            return seed / m;
        }
    }, []);

    // Initialize Scene
    useEffect(() => {
        if (!mountRef.current || rendererRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 2.5;
        cameraRef.current = camera;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);
        
        const light = new THREE.DirectionalLight(0xffffff, 2.5);
        light.position.set(5, 3, 5);
        scene.add(light);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#3B5998'; 
            ctx.fillRect(0, 0, 1024, 512);
            ctx.fillStyle = '#228b22'; 
            ctx.fillRect(480, 180, 260, 160);
            ctx.fillRect(150, 140, 100, 280);
            ctx.fillRect(750, 350, 70, 50);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1024, 40);
            ctx.fillRect(0, 472, 1024, 40);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            for(let i = 0; i < 20; i++) {
                const x = Math.random() * 1024;
                const y = Math.random() * 512;
                ctx.beginPath();
                ctx.ellipse(x, y, 30 + Math.random() * 40, 15 + Math.random() * 20, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 10, specular: 0x333333 });
        const sphere = new THREE.Mesh(geometry, material);
        sphereRef.current = sphere;
        scene.add(sphere);

        const locationGroup = new THREE.Group();
        locationGroupRef.current = locationGroup;
        sphere.add(locationGroup);

        let isMouseDown = false, isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseDown = (e: MouseEvent | TouchEvent) => {
            isMouseDown = true;
            isDragging = false;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            previousMousePosition = { x: clientX, y: clientY };
        }

        const onMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isMouseDown || !sphereRef.current) return;
            isDragging = true;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - previousMousePosition.x;
            const deltaY = clientY - previousMousePosition.y;

            sphereRef.current.rotation.y += deltaX * 0.005;
            sphereRef.current.rotation.x += deltaY * 0.005;
            
            previousMousePosition = { x: clientX, y: clientY };
        }
        
        const onMouseUp = (e: MouseEvent | TouchEvent) => {
             if (!isDragging && locationGroupRef.current && cameraRef.current) {
                const rect = renderer.domElement.getBoundingClientRect();
                const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
                const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

                mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, cameraRef.current);
                const intersects = raycaster.intersectObjects(locationGroupRef.current.children);

                if (intersects.length > 0) {
                    const locationName = (intersects[0].object as any).locationName;
                    if(locationName) onLocationClick(locationName);
                }
            }
            isMouseDown = false;
            isDragging = false;
        }

        const onWheel = (e: WheelEvent) => {
            if (!cameraRef.current) return;
            const zoomSpeed = 0.1;
            let newZ = cameraRef.current.position.z + e.deltaY * zoomSpeed;
            newZ = Math.max(1.5, Math.min(newZ, 5));
            cameraRef.current.position.z = newZ;
        }

        currentMount.addEventListener('mousedown', onMouseDown);
        currentMount.addEventListener('mousemove', onMouseMove);
        currentMount.addEventListener('mouseup', onMouseUp);
        currentMount.addEventListener('touchstart', onMouseDown, { passive: false });
        currentMount.addEventListener('touchmove', onMouseMove, { passive: false });
        currentMount.addEventListener('touchend', onMouseUp);
        currentMount.addEventListener('wheel', onWheel);

        let animationFrameId: number;
        const animate = () => {
            if (sphereRef.current && !isMouseDown) sphereRef.current.rotation.y += 0.0005;
            if (sceneRef.current && cameraRef.current && rendererRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!currentMount || !cameraRef.current || !rendererRef.current) return;
            cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('mousedown', onMouseDown);
            currentMount.removeEventListener('mousemove', onMouseMove);
            currentMount.removeEventListener('mouseup', onMouseUp);
            currentMount.removeEventListener('touchstart', onMouseDown);
            currentMount.removeEventListener('touchmove', onMouseMove);
            currentMount.removeEventListener('touchend', onMouseUp);
            currentMount.removeEventListener('wheel', onWheel);
            if (rendererRef.current && rendererRef.current.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current = undefined;
            cancelAnimationFrame(animationFrameId);
        };
    }, [onLocationClick]); // Only run on mount and if onLocationClick changes

    // Update Markers
    useEffect(() => {
        if (!locationGroupRef.current) return;

        const locationGroup = locationGroupRef.current;
        const existingMarkers = new Set(locationGroup.children.map(c => (c as any).locationName));
        const randomGenerator = generatePseudoRandom();

        locations.forEach(loc => {
            if (!existingMarkers.has(loc)) {
                if (!locationCoordsRef.current.has(loc)) {
                    const seededRandom = randomGenerator(loc);
                    locationCoordsRef.current.set(loc, {
                        lat: (seededRandom * 180) - 90,
                        lon: (seededRandom * 360) - 180
                    });
                }
                
                const { lat, lon } = locationCoordsRef.current.get(loc)!;
                const position = latLonToVector3(lat, lon, 1);
                
                const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x7B68EE });
                const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.copy(position);
                (marker as any).locationName = loc;
                locationGroup.add(marker);
            }
        });
    }, [locations, generatePseudoRandom]);

    return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

export const GlobeDisplay = memo(GlobeDisplayComponent);
