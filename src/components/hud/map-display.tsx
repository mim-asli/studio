
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

    const generatePseudoRandom = useCallback((str: string) => {
        let h = 1779033703, i = str.length;
        while(i > 0) {
            h = (h ^ str.charCodeAt(--i)) * 3432918353;
            h = h << 13 | h >>> 19;
        }
        return () => {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return ((h ^= h >>> 16) >>> 0) / 4294967296;
        }
    }, []);

    useEffect(() => {
        locations.forEach(loc => {
            if (!locationCoordsRef.current.has(loc)) {
                const rng = generatePseudoRandom(loc);
                const xRand = rng();
                const yRand = rng();
                locationCoordsRef.current.set(loc, {
                    x: xRand * (MAP_WIDTH * 0.9) + (MAP_WIDTH * 0.05),
                    y: yRand * (MAP_HEIGHT * 0.9) + (MAP_HEIGHT * 0.05),
                });
            }
        });
    }, [locations, generatePseudoRandom]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const { deltaY } = e;
        const zoomFactor = 1.1;
        const newZoom = deltaY < 0 ? viewState.zoom * zoomFactor : viewState.zoom / zoomFactor;
        setViewState(vs => ({ ...vs, zoom: Math.min(Math.max(newZoom, 0.2), 3) }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setViewState(vs => ({ ...vs, x: vs.x + dx, y: vs.y + dy }));
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

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
                        className="absolute top-0 left-0 transition-transform duration-100 ease-out"
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
                                        onClick={() => onFastTravel(`سفر سریع به ${loc}`)}
                                    >
                                        <div 
                                            className="absolute bottom-full mb-2 w-max px-2 py-1 bg-black/70 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                        >
                                            سفر سریع به {loc}
                                        </div>
                                        <div 
                                            className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"
                                            style={{ transform: `scale(${1 / viewState.zoom})` }}
                                        ></div>
                                        <div 
                                            className="w-px h-4 bg-white/50" 
                                            style={{ transform: `scale(${1 / viewState.zoom})` }}
                                        ></div>
                                        <div
                                            className="text-white font-bold text-sm"
                                            style={{
                                                transform: `scale(${1 / viewState.zoom})`,
                                                textShadow: '1px 1px 2px black',
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
