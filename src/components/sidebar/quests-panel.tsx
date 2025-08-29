
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface QuestsPanelProps {
    quests: string[];
}

export function QuestsPanel({ quests }: QuestsPanelProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">مأموریت‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
                {quests && quests.length > 0 ? (
                    quests.map((quest, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{quest}</div>)
                ) : (
                    <p className="text-muted-foreground text-sm text-center pt-10">هیچ مأموریت فعالی وجود ندارد.</p>
                )}
            </CardContent>
        </Card>
    );
}
