
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Hammer, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CraftingPanelProps {
    inventory: string[];
    onCraft: (ingredients: string[]) => void;
    isCrafting: boolean;
}

export function CraftingPanel({ inventory, onCraft, isCrafting }: CraftingPanelProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleSelect = (item: string) => {
        setSelectedItems(prev => 
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const handleCraftClick = () => {
        if (selectedItems.length > 1) {
            onCraft(selectedItems);
            setSelectedItems([]);
        }
    };

    const uniqueInventory = Array.from(new Set(inventory));

    return (
        <Card className="bg-transparent border h-full flex flex-col">
            <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">ساخت و ساز</CardTitle>
                <CardDescription>آیتم‌ها را برای ترکیب انتخاب کنید.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <div className="flex-grow space-y-2 pr-2 overflow-y-auto border rounded-md p-2 bg-muted/20">
                    {uniqueInventory.length > 0 ? (
                        uniqueInventory.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox 
                                    id={`craft-${index}`} 
                                    onCheckedChange={() => handleSelect(item)}
                                    checked={selectedItems.includes(item)}
                                    disabled={isCrafting}
                                />
                                <Label 
                                    htmlFor={`craft-${index}`}
                                    className={cn("text-sm w-full p-2 rounded-md border", selectedItems.includes(item) ? "bg-primary/20 border-primary" : "bg-muted/50")}
                                >
                                    {item}
                                </Label>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm text-center py-10">
                            هیچ آیتمی برای ساخت و ساز در دسترس نیست.
                        </p>
                    )}
                </div>
                <Button 
                    onClick={handleCraftClick} 
                    disabled={selectedItems.length < 2 || isCrafting}
                    className="w-full"
                >
                    {isCrafting ? <Loader2 className="animate-spin" /> : <Hammer />}
                    ساخت
                </Button>
            </CardContent>
        </Card>
    );
}
