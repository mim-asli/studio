
"use client";

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/button';

interface MapDisplayProps {
    locations: string[];
    onFastTravel: (location: string) => void;
}

const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1536;

const MapControlButton = ({ onClick, children, 'aria-label': ariaLabel }: { onClick: () => void, children: React.ReactNode, 'aria-label': string }) => (
    <Button
        size="icon"
        variant="default"
        className="w-10 h-10 rounded-full shadow-lg bg-background/80 text-foreground hover:bg-background"
        onClick={onClick}
        aria-label={ariaLabel}
    >
        {children}
    </Button>
);

const MapDisplayComponent = ({ locations, onFastTravel }: MapDisplayProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [viewState, setViewState] = useState({ x: -MAP_WIDTH / 4, y: -MAP_HEIGHT / 4, zoom: 0.5 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const locationCoordsRef = useRef<Map<string, { x: number, y: number }>>(new Map());

    const generatePseudoRandom = useCallback((str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return (seed: number) => {
            const x = Math.sin(hash + seed) * 10000;
            return x - Math.floor(x);
        };
    }, []);

    useEffect(() => {
        locations.forEach(loc => {
            if (!locationCoordsRef.current.has(loc)) {
                const rng = generatePseudoRandom(loc);
                const paddingX = MAP_WIDTH * 0.1;
                const paddingY = MAP_HEIGHT * 0.1;
                const x = rng(1) * (MAP_WIDTH - 2 * paddingX) + paddingX;
                const y = rng(2) * (MAP_HEIGHT - 2 * paddingY) + paddingY;
                locationCoordsRef.current.set(loc, { x, y });
            }
        });
    }, [locations, generatePseudoRandom]);

    const zoom = useCallback((factor: number, clientX?: number, clientY?: number) => {
        setViewState(vs => {
            if (!mapRef.current) return vs;

            const rect = mapRef.current.getBoundingClientRect();
            const x = (clientX ?? rect.width / 2) - rect.left;
            const y = (clientY ?? rect.height / 2) - rect.top;
            
            const newZoom = Math.min(Math.max(vs.zoom * factor, 0.2), 3);
            const zoomRatio = newZoom / vs.zoom;

            const newX = x - (x - vs.x) * zoomRatio;
            const newY = y - (y - vs.y) * zoomRatio;

            return { x: newX, y: newY, zoom: newZoom };
        });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX, e.clientY);
    }, [zoom]);

    const startDrag = (clientX: number, clientY: number) => {
        setIsDragging(true);
        dragStart.current = { x: clientX, y: clientY };
    }

    const handleDrag = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        setViewState(vs => ({ ...vs, x: vs.x + dx, y: vs.y + dy }));
        dragStart.current = { x: clientX, y: clientY };
    }

    const endDrag = () => setIsDragging(false);

    // Mouse Events
    const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); startDrag(e.clientX, e.clientY); };
    const handleMouseMove = (e: React.MouseEvent) => { e.preventDefault(); handleDrag(e.clientX, e.clientY); };

    // Touch Events
    const handleTouchStart = (e: React.TouchEvent) => { if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY); };
    const handleTouchMove = (e: React.TouchEvent) => { if (e.touches.length === 1) handleDrag(e.touches[0].clientX, e.touches[0].clientY); };


    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">نقشه جهان</CardTitle>
                <CardDescription className="text-sm text-muted-foreground p-0 pt-2">برای جابجایی بکشید. برای زوم از دکمه‌ها یا چرخ ماوس استفاده کنید.</CardDescription>
            </CardHeader>
            <CardContent className="text-center w-full flex-grow overflow-hidden p-0 relative">
                <div 
                    ref={mapRef} 
                    className="w-full h-full bg-gray-800 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={endDrag}
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
                                    style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFastTravel(`سفر سریع به ${loc}`);
                                    }}
                                >
                                    <div className="relative flex flex-col items-center cursor-pointer group">
                                        <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" style={{ transform: `scale(${1 / viewState.zoom})` }}>
                                            سفر سریع به {loc}
                                        </div>
                                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform" style={{ transform: `scale(${1 / viewState.zoom})` }}></div>
                                        <div className="w-px h-4 bg-white/70" style={{ transform: `scale(${1 / viewState.zoom})` }}></div>
                                        <div className="text-white font-bold px-2 py-1 rounded-md" style={{ transform: `scale(${1 / viewState.zoom})`, textShadow: '1px 1px 3px black, -1px -1px 3px black, 1px -1px 3px black, -1px 1px 3px black' }}>
                                            {loc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                 <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <MapControlButton onClick={() => zoom(1.2)} aria-label="بزرگنمایی">
                        <ZoomIn />
                    </MapControlButton>
                    <MapControlButton onClick={() => zoom(1 / 1.2)} aria-label="کوچک نمایی">
                        <ZoomOut />
                    </MapControlButton>
                </div>
            </CardContent>
        </Card>
    );
}

export const MapDisplay = memo(MapDisplayComponent);
