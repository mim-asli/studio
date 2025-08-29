
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FeatureSelectionProps {
    title: string;
    items: any;
    selected: string | null;
    onSelect: (key: string) => void;
    columns?: "2" | "3" | "4";
    layout?: "grid" | "list";
    showDescription?: boolean;
}

export const FeatureSelection = ({ 
    title, 
    items, 
    selected, 
    onSelect, 
    columns = "3", 
    layout = "grid",
    showDescription = false
}: FeatureSelectionProps) => {
    
    const containerClasses = layout === "grid" ? {
        "2": "grid-cols-2",
        "3": "grid-cols-2 md:grid-cols-3",
        "4": "grid-cols-2 md:grid-cols-4",
    } : {};
    
    return (
    <div>
        {title && <Label className="text-lg font-bold text-primary mb-4 block text-center md:text-right">{title}</Label>}
        <div className={cn(
            layout === 'grid' ? 'grid gap-4' : 'space-y-3 max-h-80 overflow-y-auto pr-2',
            layout === 'grid' && containerClasses[columns],
        )}>
            {Object.entries(items).map(([key, value]: [string, any]) => (
                <div 
                    key={key}
                    onClick={() => onSelect(key)}
                    className={cn(
                        "cursor-pointer transition-all border rounded-lg",
                        selected === key 
                            ? (layout === 'grid' ? "ring-2 ring-primary border-primary" : "bg-primary/20 border-primary")
                            : (layout === 'grid' ? "border-transparent hover:shadow-primary/50 hover:shadow-md hover:-translate-y-1 bg-card" : "hover:bg-muted/50 bg-card")
                    )}
                >
                    {layout === 'grid' ? (
                        <div className="items-center text-center p-4">
                            <div className="p-3 bg-muted rounded-full mb-2 inline-block">
                                <value.icon className="w-7 h-7 text-foreground" />
                            </div>
                            <h3 className="text-base font-semibold">{key}</h3>
                            {showDescription && value.description && <p className="text-xs text-muted-foreground">{value.description}</p>}
                        </div>
                    ) : (
                         <div className="p-4 flex items-center gap-4">
                            <value.icon className="w-6 h-6 text-primary" />
                            <div>
                                <p className="font-bold">{key}</p>
                                {showDescription && <p className="text-sm text-muted-foreground">{value.description}</p>}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
    )
};
