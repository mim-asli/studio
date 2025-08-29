
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { manageCombatScenario } from "@/ai/flows/manage-combat-scenario";
import type { GameState, GenerateNextTurnOutput, ManageCombatScenarioOutput } from "@/lib/types";

/**
 * Handles a turn in exploration mode.
 * Fetches the next state from the AI and updates the game state.
 */
export const handleExplorationTurn = async (
    currentState: GameState,
    playerAction: string,
    onImagePrompt: (prompt: string) => void,
    toast: (args: any) => void
): Promise<GameState> => {
    const gameStateForAI = JSON.stringify(currentState);

    const nextTurn: GenerateNextTurnOutput = await generateNextTurn({
        gameState: gameStateForAI,
        playerAction,
        difficulty: currentState.difficulty,
        gmPersonality: currentState.gmPersonality,
    });

    // Trigger image generation if prompt is provided
    if (nextTurn.imagePrompt) {
        onImagePrompt(nextTurn.imagePrompt);
    }

    // Fire toasts for significant events
    if (nextTurn.newCharacter) toast({ title: "شخصیت جدید", description: `شما با ${nextTurn.newCharacter} ملاقات کردید.` });
    if (nextTurn.newQuest) toast({ title: "مأموریت جدید", description: nextTurn.newQuest });
    if (nextTurn.newLocation) toast({ title: "مکان جدید کشف شد", description: `شما ${nextTurn.newLocation} را پیدا کردید.` });

    const { story: newStory, ...restOfNextTurn } = nextTurn;

    const updatedGameState: GameState = {
        ...currentState,
        ...restOfNextTurn,
        story: [...currentState.story, newStory],
        gameStarted: true,
        isLoading: false,
    };

    return updatedGameState;
};

/**
 * Handles a turn in combat mode.
 * Fetches the combat result from the AI and updates the game state.
 */
export const handleCombatTurn = async (
    currentState: GameState,
    playerAction: string,
    toast: (args: any) => void
): Promise<GameState> => {
    const combatResult: ManageCombatScenarioOutput = await manageCombatScenario({
        playerAction,
        playerState: currentState.playerState,
        enemies: currentState.enemies || [],
        combatLog: currentState.story.slice(-5),
    });

    const { turnNarration, updatedPlayerState, updatedEnemies, choices, isCombatOver, rewards } = combatResult;

    const newStory = [...currentState.story, turnNarration];
    let newInventory = currentState.inventory;

    if (isCombatOver) {
        newStory.push("مبارزه تمام شد.");
        if (rewards && rewards.items && rewards.items.length > 0) {
            newInventory = [...newInventory, ...rewards.items];
            const rewardText = `شما به دست آوردید: ${rewards.items.join(', ')}`;
            newStory.push(rewardText);
            toast({ title: "غنائم جنگی!", description: rewardText });
        }
    }

    const updatedGameState: GameState = {
        ...currentState,
        story: newStory,
        playerState: updatedPlayerState,
        enemies: updatedEnemies,
        choices: isCombatOver ? ["ادامه بده..."] : choices,
        isCombat: !isCombatOver,
        inventory: newInventory,
        isLoading: false,
    };

    return updatedGameState;
};
