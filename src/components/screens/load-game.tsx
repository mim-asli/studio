
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Download, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import type { SaveFile } from '@/lib/types';
import { useGameContext } from '@/context/game-context';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";


export function LoadGame() {
    const { savedGames, loadGame, deleteSave, importSave, exportSave } = useGameContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleDeleteGame = (saveId: string) => {
        deleteSave(saveId);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'application/json') {
                toast({
                    variant: 'destructive',
                    title: 'فایل نامعتبر',
                    description: 'لطفاً یک فایل ذخیره با فرمت .json انتخاب کنید.',
                });
                return;
            }
            await importSave(file);
            // Reset the input value to allow importing the same file again
            event.target.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-headline text-primary">بارگذاری ماجراجویی</h1>
                    <div className="w-10"></div>
                </div>

                <Card className="mb-6 border-primary/20">
                    <CardHeader className="flex-row justify-between items-center">
                        <div>
                            <CardTitle>بازی‌های ذخیره شده</CardTitle>
                            <CardDescription>یک ماجراجویی را برای ادامه انتخاب کنید.</CardDescription>
                        </div>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                            <Button onClick={handleImportClick} variant="outline">
                                <UploadCloud className="ml-2"/>
                                وارد کردن
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {savedGames.length > 0 ? (
                            <ul className="space-y-3">
                                {savedGames.map((save) => (
                                     <li key={save.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group border hover:border-primary/50 transition-colors">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate">{save.characterName || 'شخصیت بی‌نام'}</p>
                                            <p className="text-sm text-muted-foreground truncate">{save.scenarioTitle}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                آخرین ذخیره: {new Date(save.timestamp).toLocaleString('fa-IR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => loadGame(save.id)}>
                                                بارگذاری
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" onClick={() => exportSave(save.id)}>
                                                <Download className="w-4 h-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                           این عمل قابل بازگشت نیست. این کار ماجراجویی "{save.characterName}" را برای همیشه حذف خواهد کرد.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>لغو</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteGame(save.id)} className="bg-destructive hover:bg-destructive/90">
                                                            حذف
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                هیچ بازی ذخیره شده‌ای یافت نشد.
                            </p>
                        )}
                    </CardContent>
                </Card>
                 <div className="text-center mt-10">
                    <Link href="/" passHref>
                        <Button>
                            <ArrowLeft className="ml-2" />
                            بازگشت به منوی اصلی
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
