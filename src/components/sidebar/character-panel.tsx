
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CharacterPanelProps {
    skills: string[];
}

export function CharacterPanel({ skills }: CharacterPanelProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">مهارت‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
                {skills && skills.length > 0 ? (
                    skills.map((skill, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{skill}</div>)
                ) : (
                    <p className="text-muted-foreground text-sm text-center pt-10">شما هنوز مهارت خاصی ندارید.</p>
                )}
            </CardContent>
        </Card>
    );
}
