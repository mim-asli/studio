
"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

interface GlobeDisplayProps {
    locations: string[];
    onLocationClick: (location: string) => void;
}

export function GlobeDisplay({ locations, onLocationClick }: GlobeDisplayProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const locationsRef = useRef(locations);
    
    useEffect(() => {
        locationsRef.current = locations;
    }, [locations])

    const latLonToVector3 = useCallback((lat: number, lon: number, radius: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));

        return new THREE.Vector3(x, y, z);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        
        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 2.5;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);
        
        // Lights
        const light = new THREE.DirectionalLight(0xffffff, 2.5);
        light.position.set(5, 3, 5);
        scene.add(light);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Globe
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Custom texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#3B5998'; // Deep blue ocean from theme
            ctx.fillRect(0, 0, 1024, 512);
            ctx.fillStyle = '#228b22'; // Green continents
            // Simple continent shapes
            ctx.fillRect(480, 180, 260, 160); // Eurasia
            ctx.fillRect(150, 140, 100, 280); // Americas
            ctx.fillRect(750, 350, 70, 50);   // Australia
            ctx.fillStyle = '#ffffff'; // Ice caps
            ctx.fillRect(0, 0, 1024, 40);
            ctx.fillRect(0, 472, 1024, 40);
             // Clouds
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
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 10,
            specular: 0x333333,
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Location markers
        const locationGroup = new THREE.Group();
        sphere.add(locationGroup);
        
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x7B68EE }); // Accent color
        const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        
        // Generate pseudo-random, stable positions for locations
        const locationCoords: { [key: string]: { lat: number, lon: number } } = {};
        const a = 1664525;
        const c = 1013904223;
        const m = 2**32;
        let seed = 1;
        
        const pseudoRandom = () => {
            seed = (a * seed + c) % m;
            return seed / m;
        }

        locationsRef.current.forEach(loc => {
            if (!locationCoords[loc]) {
                locationCoords[loc] = {
                    lat: (pseudoRandom() * 180) - 90,
                    lon: (pseudoRandom() * 360) - 180
                };
            }
            const { lat, lon } = locationCoords[loc];
            const position = latLonToVector3(lat, lon, 1);
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(position);
            (marker as any).locationName = loc;
            locationGroup.add(marker);
        });

        // Mouse controls
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
            if (!isMouseDown) return;
            isDragging = true;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - previousMousePosition.x;
            const deltaY = clientY - previousMousePosition.y;

            sphere.rotation.y += deltaX * 0.005;
            sphere.rotation.x += deltaY * 0.005;
            
            previousMousePosition = { x: clientX, y: clientY };
        }
        
        const onMouseUp = (e: MouseEvent | TouchEvent) => {
             if (!isDragging) {
                const rect = renderer.domElement.getBoundingClientRect();
                const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
                const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

                mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(locationGroup.children);

                if (intersects.length > 0) {
                    const locationName = (intersects[0].object as any).locationName;
                    if(locationName) {
                        onLocationClick(locationName);
                    }
                }
            }
            isMouseDown = false;
            isDragging = false;
        }

        currentMount.addEventListener('mousedown', onMouseDown);
        currentMount.addEventListener('mousemove', onMouseMove);
        currentMount.addEventListener('mouseup', onMouseUp);
        currentMount.addEventListener('touchstart', onMouseDown, { passive: false });
        currentMount.addEventListener('touchmove', onMouseMove, { passive: false });
        currentMount.addEventListener('touchend', onMouseUp);


        // Animation loop
        let animationFrameId: number;
        const animate = () => {
            if (!isMouseDown) {
              sphere.rotation.y += 0.0005;
            }
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!currentMount) return;
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeEventListener('mousedown', onMouseDown);
                currentMount.removeEventListener('mousemove', onMouseMove);
                currentMount.removeEventListener('mouseup', onMouseUp);
                currentMount.removeEventListener('touchstart', onMouseDown);
                currentMount.removeEventListener('touchmove', onMouseMove);
                currentMount.removeEventListener('touchend', onMouseUp);
                currentMount.removeChild(renderer.domElement);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [latLonToVector3, onLocationClick]);

    return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
