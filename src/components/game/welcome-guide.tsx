
"use client";

import { X, Gamepad2, MousePointerClick, Menu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface WelcomeGuideProps {
    onClose: () => void;
}

export function WelcomeGuide({ onClose }: WelcomeGuideProps) {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-30 animate-in fade-in-50 slide-in-from-top-10 duration-500">
            <Card className="bg-background/80 backdrop-blur-sm border-primary shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        به داستان خوش آمدید!
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        در اینجا چند نکته برای شروع ماجراجویی شما آورده شده است.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-start gap-4">
                        <Gamepad2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">پنل اقدامات</h4>
                            <p className="text-muted-foreground">
                                در پایین صفحه، می‌توانید از بین انتخاب‌های پیشنهادی یکی را برگزینید یا اقدام سفارشی خود را تایپ کنید تا داستان را پیش ببرید.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Menu className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">نوار کناری</h4>
                            <p className="text-muted-foreground">
                                وضعیت شخصیت، موجودی، مهارت‌ها و نقشه خود را از طریق تب‌های موجود در نوار کناری (در دسکتاپ) یا با کلیک بر روی دکمه منو (در موبایل) بررسی کنید.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MousePointerClick className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">گفتگو با کارگردان</h4>
                            <p className="text-muted-foreground">
                                اگر سؤالی در مورد دنیا دارید یا می‌خواهید یک سناریوی "چه می‌شد اگر..." را بررسی کنید، روی دکمه ربات در پنل اقدامات کلیک کنید.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
