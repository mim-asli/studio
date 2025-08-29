
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { startingEquipment } from "@/lib/game-data";
import { PlusCircle, MinusCircle } from "lucide-react";

interface ItemManagerProps {
    totalPoints: number;
    items: Record<string, number>;
    setItems: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function ItemManager({ totalPoints, items, setItems }: ItemManagerProps) {

    const usedPoints = Object.entries(items).reduce((acc, [item, count]) => {
        const itemCost = startingEquipment[item as keyof typeof startingEquipment]?.cost || 0;
        return acc + (itemCost * count);
    }, 0);
    const remainingPoints = totalPoints - usedPoints;

    const handleAddItem = (item: keyof typeof startingEquipment) => {
        if (remainingPoints >= startingEquipment[item].cost) {
            setItems(prev => ({...prev, [item]: (prev[item] || 0) + 1 }));
        }
    }
    
    const handleRemoveItem = (item: keyof typeof startingEquipment) => {
        setItems(prev => {
            const newItems = {...prev};
            if (newItems[item] > 1) {
                newItems[item]--;
            } else {
                delete newItems[item];
            }
            return newItems;
        });
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Available Items Column */}
           <div>
               <Card>
                   <CardHeader>
                       <CardTitle>آیتم‌های موجود</CardTitle>
                       <CardDescription>امتیاز باقی‌مانده: <span className="font-bold text-primary">{remainingPoints} / {totalPoints}</span></CardDescription>
                   </CardHeader>
                   <CardContent className="max-h-80 overflow-y-auto pr-2 space-y-2">
                       {Object.entries(startingEquipment).map(([name, data]) => (
                           <div key={name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                               <div>
                                   <p className="font-semibold">{name} <span className="text-xs text-primary">({data.cost} امتیاز)</span></p>
                                   <p className="text-xs text-muted-foreground">{data.description}</p>
                               </div>
                               <Button size="icon" variant="ghost" onClick={() => handleAddItem(name as keyof typeof startingEquipment)} disabled={remainingPoints < data.cost}>
                                   <PlusCircle className="text-green-500"/>
                               </Button>
                           </div>
                       ))}
                   </CardContent>
               </Card>
           </div>

           {/* Selected Items Column */}
           <div>
               <Card>
                    <CardHeader>
                       <CardTitle>کوله پشتی شما</CardTitle>
                       <CardDescription>آیتم‌هایی که انتخاب کرده‌اید.</CardDescription>
                   </CardHeader>
                   <CardContent className="max-h-80 overflow-y-auto pr-2 space-y-2">
                       {Object.keys(items).length > 0 ? Object.entries(items).map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                               <div>
                                   <p className="font-semibold">{name} <span className="text-muted-foreground">x{count}</span></p>
                               </div>
                               <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(name as keyof typeof startingEquipment)}>
                                   <MinusCircle className="text-red-500"/>
                               </Button>
                           </div>
                       )) : (
                           <p className="text-center text-muted-foreground py-10">کوله پشتی شما خالی است.</p>
                       )}
                   </CardContent>
               </Card>
           </div>
        </div>
    )
}
