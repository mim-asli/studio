
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InventoryPanelProps {
    inventory: string[];
}

export function InventoryPanel({ inventory }: InventoryPanelProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">موجودی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
                {inventory && inventory.length > 0 ? (
                    inventory.map((item, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{item}</div>)
                ) : (
                    <p className="text-muted-foreground text-sm text-center pt-10">کوله پشتی شما خالی است.</p>
                )}
            </CardContent>
        </Card>
    );
}
