
"use client";

import { useState } from "react";
import { StoryDisplay } from "@/components/game/story-display";
import { InteractionPanel } from "@/components/game/interaction-panel";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, LogOut, FilePlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { GameDirectorChat } from "./game-director-chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useGameContext } from "@/context/game-context";
import { cn } from "@/lib/utils";

export function GameClient() {
    const { 
        gameState, 
        handleAction, 
        resetGame,
        currentImage,
        isImageLoading,
    } = useGameContext();
    const [isDirectorChatOpen, setIsDirectorChatOpen] = useState(false);
  
    if (!gameState) {
        // This should ideally be handled by the page, but as a fallback:
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">در حال آماده سازی بازی...</p>
            </div>
        )
    }

    if (gameState.isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
                <AlertTriangle className="w-24 h-24 text-destructive mb-4" />
                <h1 className="text-6xl font-headline text-destructive mb-2">بازی تمام شد</h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{gameState.story[gameState.story.length-1]}</p>
                <Button size="lg" onClick={resetGame}>
                    <FilePlus className="ml-2" /> شروع یک افسانه جدید
                </Button>
            </div>
        );
    }
  
  return (
        <TooltipProvider>
            <GameDirectorChat 
                isOpen={isDirectorChatOpen}
                onClose={() => setIsDirectorChatOpen(false)}
            />
            <div className="relative w-full h-screen overflow-hidden">
            <main className="grid h-screen grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] text-foreground font-body">
                {/* Main Content */}
                <div className="flex flex-col gap-4 h-full p-2 sm:p-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-headline text-primary tracking-widest uppercase">داستان</h1>
                        <div className="flex items-center gap-2">
                        <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost"><LogOut/></Button>
                                </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>خروج به منوی اصلی</p>
                                </TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>بازگشت به منوی اصلی؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                پیشرفت شما به صورت خودکار ذخیره شده است. آیا می‌خواهید به منوی اصلی بازگردید؟
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>لغو</AlertDialogCancel>
                                <AlertDialogAction onClick={resetGame}>
                                خروج
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </div>
                    <div className="relative flex-grow border rounded-md shadow-inner bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-black/60" />
                        <StoryDisplay 
                            storySegments={gameState.story} 
                            image={currentImage}
                            isImageLoading={isImageLoading}
                        />
                        {gameState.isLoading && !isImageLoading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            </div>
                        )}
                    </div>
                    <InteractionPanel 
                        choices={gameState.choices} 
                        onAction={handleAction} 
                        isLoading={gameState.isLoading}
                        onDirectorChat={() => setIsDirectorChatOpen(true)}
                    />
                </div>

                {/* Sidebar */}
                <div className="h-full bg-background/50 backdrop-blur-md p-4 border-l">
                    <Sidebar />
                </div>
            </main>
            </div>
        </TooltipProvider>
    );
}
