
"use client";

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ZoomIn, ZoomOut, Building2, Trees, Mountain, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface MapDisplayProps {
    locations: string[];
    currentLocation: string;
    onFastTravel: (location: string) => void;
}

const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1536;

// A list of icons to be used for different locations
const locationIcons = [Building2, Trees, Mountain, Home];

// This component is wrapped in memo to prevent re-renders when props don't change
const MapDisplayComponent = ({ locations, onFastTravel, currentLocation }: MapDisplayProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [viewState, setViewState] = useState({ x: -MAP_WIDTH / 4, y: -MAP_HEIGHT / 4, zoom: 0.5 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    // Use a ref to store coordinates to prevent re-generation on every render
    const locationCoordsRef = useRef<Map<string, { x: number, y: number, icon: React.ElementType }>>(new Map());

    // Pseudo-random generator based on a string to ensure locations always appear in the same spot
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

    // Generate and store coordinates for new locations
    useEffect(() => {
        locations.forEach(loc => {
            if (!locationCoordsRef.current.has(loc)) {
                const rng = generatePseudoRandom(loc);
                const paddingX = MAP_WIDTH * 0.1;
                const paddingY = MAP_HEIGHT * 0.1;
                const x = rng(1) * (MAP_WIDTH - 2 * paddingX) + paddingX;
                const y = rng(2) * (MAP_HEIGHT - 2 * paddingY) + paddingY;
                const icon = locationIcons[Math.floor(rng(3) * locationIcons.length)];
                locationCoordsRef.current.set(loc, { x, y, icon });
            }
        });
    }, [locations, generatePseudoRandom]);

    // Function to handle zooming, wrapped in useCallback for performance
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

    // Event handlers, wrapped in useCallback
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

    // Touch Events for Mobile Support
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
                    className="w-full h-full bg-slate-900 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
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
                            backgroundImage: 'url(https://picsum.photos/seed/mapbg/2048/1536)',
                            backgroundSize: 'cover',
                            transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.zoom})`,
                            transformOrigin: 'top left',
                        }}
                    >
                       <svg width="100%" height="100%" className="absolute inset-0">
                          <defs>
                            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="black" strokeWidth="0.5" opacity="0.2"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>

                        {locations.map(loc => {
                            const coords = locationCoordsRef.current.get(loc);
                            if (!coords) return null;
                            const isCurrent = loc === currentLocation;
                            const Icon = coords.icon || Building2;
                            return (
                                <div
                                    key={loc}
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFastTravel(`سفر سریع به ${loc}`);
                                    }}
                                >
                                    <div className="relative flex flex-col items-center cursor-pointer group">
                                        <div className={cn(
                                            "w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                            isCurrent ? "border-yellow-400 scale-125 shadow-lg shadow-yellow-400/50" : "border-white group-hover:border-primary"
                                        )}>
                                            <Icon className="w-5 h-5 text-white"/>
                                        </div>
                                        <div 
                                            className={cn(
                                                "text-white font-bold px-2 py-1 rounded-md mt-2 text-sm whitespace-nowrap",
                                                isCurrent ? "bg-yellow-400 text-black" : "bg-black/70"
                                            )}
                                            style={{ transform: `scale(${1 / viewState.zoom})`, transformOrigin: 'center' }}
                                        >
                                            {loc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                 <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <Button
                        size="icon"
                        variant="default"
                        className="w-10 h-10 rounded-full shadow-lg bg-background/80 text-foreground hover:bg-background"
                        onClick={() => zoom(1.2)} aria-label="بزرگنمایی"
                    >
                        <ZoomIn />
                    </Button>
                    <Button
                        size="icon"
                        variant="default"
                        className="w-10 h-10 rounded-full shadow-lg bg-background/80 text-foreground hover:bg-background"
                        onClick={() => zoom(1 / 1.2)} aria-label="کوچک نمایی"
                    >
                        <ZoomOut />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Wrap with memo to prevent unnecessary re-renders
export const MapDisplay = memo(MapDisplayComponent);

    