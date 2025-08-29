
"use client";

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface MapDisplayProps {
    locations: string[];
    onFastTravel: (location: string) => void;
}

const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1536;

const MapDisplayComponent = ({ locations, onFastTravel }: MapDisplayProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [viewState, setViewState] = useState({
        x: -MAP_WIDTH / 4,
        y: -MAP_HEIGHT / 4,
        zoom: 0.5,
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const locationCoordsRef = useRef<Map<string, { x: number, y: number }>>(new Map());

    // A simple pseudo-random generator based on the location name to keep coordinates consistent
    const generatePseudoRandom = useCallback((str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return (seed: number) => {
            const x = Math.sin(hash + seed) * 10000;
            return x - Math.floor(x);
        };
    }, []);

    // Effect to generate and store coordinates for new locations
    useEffect(() => {
        locations.forEach(loc => {
            if (!locationCoordsRef.current.has(loc)) {
                const rng = generatePseudoRandom(loc);
                const paddingX = MAP_WIDTH * 0.05;
                const paddingY = MAP_HEIGHT * 0.05;
                const x = rng(1) * (MAP_WIDTH - 2 * paddingX) + paddingX;
                const y = rng(2) * (MAP_HEIGHT - 2 * paddingY) + paddingY;
                locationCoordsRef.current.set(loc, { x, y });
            }
        });
    }, [locations, generatePseudoRandom]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!mapRef.current) return;
        e.preventDefault();

        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const zoomFactor = 1.1;
        const newZoom = e.deltaY < 0 ? viewState.zoom * zoomFactor : viewState.zoom / zoomFactor;
        const clampedZoom = Math.min(Math.max(newZoom, 0.2), 3);

        const zoomRatio = clampedZoom / viewState.zoom;

        const newX = x - (x - viewState.x) * zoomRatio;
        const newY = y - (y - viewState.y) * zoomRatio;

        setViewState({ x: newX, y: newY, zoom: clampedZoom });
    }, [viewState]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setViewState(vs => ({ ...vs, x: vs.x + dx, y: vs.y + dy }));
        dragStart.current = { x: e.clientX, y: e.clientY };
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">نقشه جهان</CardTitle>
                <CardDescription className="text-sm text-muted-foreground p-0 pt-2">جهان را بچرخانید و مکان‌های کشف شده را ببینید.</CardDescription>
            </CardHeader>
            <CardContent className="text-center w-full flex-grow overflow-hidden p-0">
                <div 
                    ref={mapRef} 
                    className="w-full h-full bg-gray-800 overflow-hidden relative cursor-grab active:cursor-grabbing"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div 
                        className="absolute top-0 left-0"
                        style={{
                            width: `${MAP_WIDTH}px`,
                            height: `${MAP_HEIGHT}px`,
                            transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.zoom})`,
                            transformOrigin: 'top left',
                        }}
                    >
                        <Image
                            src="https://picsum.photos/seed/dastanmap/2048/1536"
                            alt="World Map"
                            width={MAP_WIDTH}
                            height={MAP_HEIGHT}
                            className="pointer-events-none select-none"
                            data-ai-hint="fantasy map"
                            priority
                        />

                        {locations.map(loc => {
                            const coords = locationCoordsRef.current.get(loc);
                            if (!coords) return null;
                            return (
                                <div
                                    key={loc}
                                    className="absolute -translate-x-1/2 -translate-y-full"
                                    style={{ 
                                        left: `${coords.x}px`, 
                                        top: `${coords.y}px`,
                                    }}
                                >
                                    <div 
                                        className="relative flex flex-col items-center cursor-pointer group"
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent map drag
                                            onFastTravel(`سفر سریع به ${loc}`)
                                        }}
                                    >
                                        <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                                             style={{ transform: `scale(${1 / viewState.zoom})` }}>
                                            سفر سریع به {loc}
                                        </div>
                                        <div 
                                            className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform"
                                            style={{ transform: `scale(${1 / viewState.zoom})` }}
                                        ></div>
                                        <div 
                                            className="w-px h-4 bg-white/70" 
                                            style={{ transform: `scale(${1 / viewState.zoom})` }}
                                        ></div>
                                        <div
                                            className="text-white font-bold px-2 py-1 rounded-md"
                                            style={{
                                                transform: `scale(${1 / viewState.zoom})`,
                                                textShadow: '1px 1px 3px black, -1px -1px 3px black, 1px -1px 3px black, -1px 1px 3px black',
                                            }}
                                        >
                                            {loc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export const MapDisplay = memo(MapDisplayComponent);
