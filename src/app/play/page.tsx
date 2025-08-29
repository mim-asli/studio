
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '@/context/game-context';
import { GameClient } from '@/components/game/game-client';
import { Loader2 } from 'lucide-react';

export default function PlayPage() {
    const { gameState, isLoading, isGameLoading } = useGameContext();
    const router = useRouter();

    useEffect(() => {
        // If there's no game state and it's not loading, redirect to home.
        // This prevents accessing the /play URL directly without starting a game.
        if (!isGameLoading && !gameState) {
            router.replace('/');
        }
    }, [gameState, isGameLoading, router]);

    if (isGameLoading || !gameState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">در حال بارگذاری ماجراجویی...</p>
            </div>
        );
    }
    
    return <GameClient />;
}
