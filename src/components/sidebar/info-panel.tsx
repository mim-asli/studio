
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InfoPanelProps {
    title: string;
    items: string[];
    emptyMessage: string;
    description?: string;
}

export function InfoPanel({ title, items, emptyMessage, description }: InfoPanelProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full flex flex-col">
            <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">{title}</CardTitle>
                {description && <CardDescription className="pt-1">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden pt-0">
                <ScrollArea className="h-full pr-4">
                    {items && items.length > 0 ? (
                        <ul className="space-y-2">
                            {items.map((item, index) => (
                                <li key={index} className="p-3 rounded-md bg-muted/50 text-sm border">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm text-center pt-10">
                            {emptyMessage}
                        </p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
