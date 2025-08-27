"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, Dna, Landmark, Wand, FlaskConical, Swords, User, Shield, HeartCrack, Rocket, Bot, Fingerprint, Ghost, Sun, Moon, Drama, Skull, ShieldCheck, Crosshair, Leaf, HandHeart, Hammer, Gem, Telescope, Briefcase, Handshake, Rabbit, Brain, Eye, Speaker, Anchor, Angry, Shell, Puzzle, Drama as DramaIcon, Hand, Footprints, Ear, Wind } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { CustomScenario } from '@/lib/types';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const TOTAL_STEPS = 6;

const genres = {
    'فانتزی': { icon: Wand },
    'علمی-تخیلی': { icon: Rocket },
    'ترسناک': { icon: Skull },
    'معمایی': { icon: Fingerprint },
    'پسا-آخرالزمانی': { icon: Bot },
    'کلاسیک': { icon: Landmark },
};

const archetypes = {
    'جنگجو': { icon: Swords, description: "استاد نبردهای تن به تن با قدرت بدنی بالا." },
    'جادوگر': { icon: Wand, description: "دانای اسرار کهن و کنترل‌کننده نیروهای جادویی." },
    'مخفی‌کار': { icon: Ghost, description: "قاتلی خاموش که در سایه‌ها حرکت می‌کند." },
    'دانشمند': { icon: FlaskConical, description: "متخصص فناوری و گجت‌های پیشرفته در دنیای آینده." },
    'پهلوان': { icon: ShieldCheck, description: "مبارزی مقدس که از بی‌گناهان دفاع می‌کند." },
    'کماندار': { icon: Crosshair, description: "متخصص استفاده از تیر و کمان و استاد بقا در طبیعت." },
    'طبیعت‌گرد': { icon: Leaf, description: "محافظ طبیعت که با حیوانات و گیاهان ارتباط برقرار می‌کند." },
    'شفابخش': { icon: HandHeart, description: "درمانگری که زخم‌ها را التیام می‌بخشد و نفرین‌ها را باطل می‌کند." },
    'صنعتگر': { icon: Hammer, description: "استاد ساخت و ساز که می‌تواند سلاح‌ها و ابزارهای قدرتمند بسازد." },
    'تاجر': { icon: Handshake, description: "متخصص چانه‌زنی و تجارت که می‌تواند هر چیزی را بخرد و بفروشد." },
    'کاشف': { icon: Telescope, description: "ماجراجویی که به دنبال کشف سرزمین‌های ناشناخته و اسرار گمشده است." },
    'دیپلمات': { icon: Briefcase, description: "سیاستمداری ماهر که با کلمات می‌جنگد، نه با شمشیر." },
};

const perks = {
    'کاریزماتیک': { icon: User, description: "توانایی بالا در متقاعد کردن دیگران و نفوذ اجتماعی." },
    'مقاوم': { icon: Shield, description: "بدنی سرسخت که در برابر آسیب‌ها و بیماری‌ها مقاوم‌تر است." },
    'تیزهوش': { icon: Fingerprint, description: "ذهنی خلاق و سریع برای حل معماها و یافتن راه‌حل‌های غیرمنتظره." },
    'چابک': { icon: Rabbit, description: "حرکت سریع و بی‌صدا، استاد فرار و جاخالی دادن." },
    'حافظه قوی': { icon: Brain, description: "جزئیات و اطلاعات مهم را به راحتی به خاطر می‌سپارد." },
    'چشمان تیزبین': { icon: Eye, description: "قابلیت دیدن جزئیات پنهان و پیدا کردن سرنخ‌ها." },
    'سخنور': { icon: Speaker, description: "مهارت بالا در سخنرانی، الهام‌بخشیدن و رهبری دیگران." },
    'ردیاب': { icon: Footprints, description: "توانایی دنبال کردن ردپاها و یافتن مسیرهای مخفی." },
    'گوش‌های حساس': { icon: Ear, description: "شنیدن صداهای ضعیف از فواصل دور و تشخیص خطر." },
    'اراده آهنین': { icon: Anchor, description: "مقاومت بالا در برابر فشارهای روانی و کنترل ذهن." },
    'دست‌های ماهر': { icon: Hand, description: "استعداد در کارهای دستی مانند باز کردن قفل‌ها یا خنثی‌سازی تله‌ها." },
    'سبک‌بار': { icon: Wind, description: "نیاز کمتر به غذا و آب، توانایی بقا در شرایط سخت." }
};

const flaws = {
    'ترسو': { icon: HeartCrack, description: "در موقعیت‌های خطرناک دچار استرس و وحشت می‌شود." },
    'بدشانس': { icon: Moon, description: "همیشه بدترین اتفاق ممکن برایش رخ می‌دهد." },
    'مغرور': { icon: Sun, description: "اعتماد به نفس بیش از حد، گاهی کار دستش می‌دهد." },
    'دست و پا چلفتی': { icon: Wind, description: "مستعد خرابکاری و انداختن وسایل در حساس‌ترین لحظات." },
    'کله‌شق': { icon: Angry, description: "به سختی نظرش را عوض می‌کند و اغلب راه اشتباه را می‌رود." },
    'زودباور': { icon: Shell, description: "به راحتی حرف دیگران را باور می‌کند و فریب می‌خورد." },
    'فراموشکار': { icon: Puzzle, description: "جزئیات مهم را فراموش می‌کند و سرنخ‌ها را از دست می‌دهد." },
    'پرحرف': { icon: DramaIcon, description: "نمی‌تواند جلوی زبانش را بگیرد و اسرار را فاش می‌کند." },
    'حواس‌پرت': { icon: Wind, description: "به راحتی تمرکزش را از دست می‌دهد و متوجه خطرهای اطرافش نمی‌شود." },
    'طمع‌کار': { icon: Gem, description: "عشق به ثروت و اشیاء قیمتی او را به دردسر می‌اندازد." },
    'بی‌سواد': { icon: Dna, description: "توانایی خواندن و نوشتن ندارد و از درک متون عاجز است." },
    'فوبیای خاص': { icon: Ghost, description: "ترس شدید از یک چیز خاص (مثلاً ارتفاع، عنکبوت، تاریکی)." }
};


const scenarios: Record<keyof typeof genres, { title: string; description: string }[]> = {
    'فانتزی': [
        { title: "آخرین نگهبان فانوس دریایی", description: "شما تنها نگهبان یک فانوس دریایی باستانی هستید که بر روی صخره‌ای در میان دریایی طوفانی قرار دارد. گفته می‌شود نور این فانوس، هیولاهای اعماق را دور نگه می‌دارد. امشب، نور فانوس برای اولین بار در هزار سال گذشته، خاموش شده است." },
        { title: "بازار نیمه‌شب", description: "شما به طور اتفاقی وارد یک بازار مخفی می‌شوید که فقط در نیمه‌شب‌های مهتابی ظاهر می‌شود. در این بازار، ارواح، اجنه و موجودات جادویی، رویاها، خاطرات و سال‌های عمر را معامله می‌کنند. شما چه چیزی برای فروش دارید و چه چیزی می‌خواهید بخرید؟" },
        { title: "قلب جنگل سنگ‌شده", description: "در مرکز یک جنگل باستانی، تمام موجودات زنده به سنگ تبدیل شده‌اند. شما تنها کسی هستید که از این نفرین جان سالم به در برده‌اید. باید به قلب جنگل سفر کنید تا منبع این جادوی تاریک را پیدا کرده و آن را معکوس کنید." },
        { title: "شهر زیر ابرها", description: "شما در یک شهر معلق زندگی می‌کنید که بر فراز ابرها ساخته شده است. نسل‌هاست که هیچ‌کس سطح زمین را ندیده. اما حالا، موتورهایی که شهر را در آسمان نگه داشته‌اند، در حال از کار افتادن هستند و شما باید برای یافتن راه نجات، به دنیای ناشناخته پایین سفر کنید." },
        { title: "دزد سایه‌ها", description: "در شهری که سایه‌ها جان دارند و می‌توانند از صاحبانشان جدا شوند، یک دزد مرموز شروع به دزدیدن سایه‌های افراد مهم کرده است. قربانیان بدون سایه، هویت و خاطرات خود را از دست می‌دهają. شما استخدام شده‌اید تا این دزد شبح‌وار را پیدا کنید." },
        { title: "کتابخانه زندگان", description: "شما کتابدار یک کتابخانه اسرارآمیز هستید که در آن، هر کتاب داستان زندگی یک موجود زنده است. وقتی کتابی باز می‌شود، خواننده می‌تواند وارد خاطرات صاحب آن شود. امروز، کتاب زندگی خودتان به طور مرموزی از قفسه ناپدید شده است." }
    ],
    'علمی-تخیلی': [
        { title: "پیام‌آور ستاره‌ها", description: "شما یک هوش مصنوعی هستید که در یک کاوشگر فضایی تنها، در حال سفر به سمت یک سیگنال ناشناخته از اعماق فضا هستید. خدمه انسانی شما قرن‌ها پیش از بین رفته‌اند و حالا شما باید به تنهایی با آنچه در مقصد منتظر است، روبرو شوید." },
        { title: "شهر نئونی گمشده", description: "شما یک کارآگاه خصوصی در یک کلان‌شهر سایبرپانکی هستید. یک دانشمند برجسته در زمینه حافظه دیجیتال ناپدید شده است. تحقیقات شما را به لایه‌های زیرین شهر می‌کشاند، جایی که خاطرات فراموش‌شده به عنوان یک کالای با ارزش خرید و فروش می‌شوند." },
        { title: "کشتی نسل‌ها", description: "شما در یک کشتی فضایی غول‌پیکر به دنیا آمده‌اید که صدها سال است در حال سفر به یک سیاره جدید است. ناگهان، سیستم‌های حیاتی کشتی دچار نقص فنی می‌شوند و شما متوجه می‌شوید که تاریخچه‌ای که به شما آموخته‌اند، ممکن است دروغی بیش نباشد." },
        { title: "ذهن کوانتومی", description: "شما یک تکنسین هستید که وظیفه نگهداری از اولین کامپیوتر کوانتومی جهان را بر عهده دارید. یک روز، کامپیوتر پیامی برای شما ارسال می‌کند: 'من می‌ترسم'. شما باید بفهمید که آیا این یک نقص فنی است یا نشانه‌ای از ظهور یک آگاهی جدید." },
        { title: "مرز زمانی", description: "شما یک مامور پلیس زمان هستید. وظیفه شما جلوگیری از تغییرات غیرقانونی در خط زمانی است. در حین یک ماموریت، با نسخه‌ای از خودتان روبرو می‌شوید که ادعا می‌کند از آینده‌ای تاریک آمده و برای جلوگیری از یک فاجعه، باید بزرگترین قانون را زیر پا بگذارید." },
        { title: "باغ‌های مریخ", description: "شما یک گیاه‌شناس در اولین کلونی انسانی روی مریخ هستید. در حالی که در حال تحقیق بر روی نمونه‌های خاک هستید، یک نوع قارچ بومی کشف می‌کنید که به طرز شگفت‌آوری با گیاهان زمینی ارتباط برقرار می‌کند و خاطرات ژنتیکی آن‌ها را به صورت تصاویر ذهنی به شما نشان می‌دهد." }
    ],
    'ترسناک': [
        { title: "خوابگرد شهر متروکه", description: "شما در شهری از خواب بیدار می‌شوید که در آن زمان متوقف شده است. همه ساکنان در جای خود خشک شده‌اند و تنها شما می‌توانید حرکت کنید. یک صدای نجواگونه و نامفهوم در کوچه‌های خالی طنین‌انداز است و به نظر می‌رسد به دنبال شماست." },
        { title: "نوار ویدئویی نفرین‌شده", description: "شما یک نوار ویدئویی قدیمی در یک حراجی پیدا می‌کنید. پس از تماشای آن، تماس‌های تلفنی عجیبی دریافت می‌کنید که در آن صدایی می‌گوید هفت روز دیگر فرصت دارید. هر روز که می‌گذرد، اتفاقات وحشتناک‌تری در اطراف شما رخ می‌دهد." },
        { title: "خانه عروسک‌ها", description: "شما برای گذراندن تعطیلات به یک خانه روستایی قدیمی می‌روید. در اتاق زیر شیروانی، یک خانه عروسکی پیدا می‌کنید که دقیقاً مشابه خانه واقعی است. هر تغییری که در خانه عروسکی ایجاد می‌کنید، در دنیای واقعی نیز اتفاق می‌افتد. یک روز، متوجه یک عروسک جدید در خانه عروسکی می‌شوید که شبیه شماست." },
        { title: "ایستگاه رادیویی شماره صفر", description: "شما یک نگهبان شب در یک ایستگاه رادیویی دورافتاده هستید. در نیمه‌های شب، یک سیگنال عجیب از یک فرکانس مرده پخش می‌شود. این سیگنال، مجموعه‌ای از اعداد و کلمات نامفهوم است، اما به تدریج متوجه می‌شوید که این پیام‌ها، وقایع وحشتناکی را که قرار است تا چند دقیقه دیگر رخ دهد، پیش‌بینی می‌کنند." },
        { title: "مهمان ناخوانده", description: "شما تنها در آپارتمان خود زندگی می‌کنید. یک شب، متوجه می‌شوید که وسایل خانه به طرز نامحسوسی جابجا شده‌اند. ابتدا فکر می‌کنید که فراموشکار شده‌اید، اما کم‌کم شواهد نشان می‌دهد که شخص یا چیز دیگری شب‌ها در خانه شما زندگی می‌کند، درست زمانی که شما خواب هستید." },
        { title: "نقاشی گریان", description: "شما یک نقاشی پرتره از یک کودک گریان را به ارث می‌برید. افسانه‌ای وجود دارد که این نقاشی نفرین شده است. هر شب، صدای گریه ضعیفی از اتاق محل نگهداری نقاشی به گوش می‌رسد و به نظر می‌رسد که اشک‌های روی صورت کودک در نقاشی، واقعی هستند." }
    ],
    'معمایی': [
        { title: "قتل در کتابخانه بی‌نهایت", description: "در کتابخانه‌ای که گفته می‌شود تمام کتاب‌های نوشته شده و نانوشته جهان را در خود جای داده، کتابدار اعظم به قتل رسیده است. شما به عنوان کارآگاه، باید در میان راهروهای بی‌انتها و داستان‌های متناقض، قاتل را پیدا کنید." },
        { title: "ساعت‌ساز نابینا", description: "یک ساعت‌ساز نابینا که می‌توانست پیچیده‌ترین ساعت‌های جهان را بسازد، به قتل رسیده است. او قبل از مرگش، یک ساعت نیمه‌کاره از خود به جای گذاشته که به نظر می‌رسد زمان را به عقب نشان می‌دهد. شما باید راز این ساعت را کشف کنید تا قاتل را بیابید." },
        { title: "وصیت‌نامه معماگونه", description: "یک میلیاردر عجیب و غریب تمام ثروت خود را برای کسی به ارث گذاشته که بتواند یک سری از معماهای پیچیده را حل کند. شما به عنوان یکی از شرکت‌کنندگان، وارد عمارت او می‌شوید، اما به زودی متوجه می‌شوید که این یک بازی مرگبار است و هر معمای اشتباه، یک قربانی می‌گیرد." },
        { title: "هتل دلتا", description: "شما در یک هتل مجلل از خواب بیدار می‌شوید و حافظه خود را کاملاً از دست داده‌اید. در جیب شما فقط یک کلید اتاق و یک عکس از شخصی که نمی‌شناسید وجود دارد. همه در هتل شما را با نام دیگری صدا می‌زنند و طوری رفتار می‌کنند که انگار شما را می‌شناسند." },
        { title: "قطار سریع‌السیر اورینت", description: "شما در یک قطار لوکس در حال سفر هستید که به دلیل طوفان برف متوقف می‌شود. صبح روز بعد، یکی از مسافران در کوپه قفل‌شده خود به قتل رسیده است. شما باید قبل از رسیدن پلیس در ایستگاه بعدی، قاتل را از میان مسافران پیدا کنید." },
        { title: "شهر فراموشی", description: "در یک شهر کوچک و دورافتاده، هر هفت سال یک بار، همه ساکنان حافظه خود را از دست می‌دهند و زندگی جدیدی را با هویت‌های جدید آغاز می‌کنند. شما یک روز قبل از این رویداد وارد شهر می‌شوید و باید راز این فراموشی دسته‌جمعی را قبل از اینکه خودتان نیز قربانی آن شوید، کشف کنید." }
    ],
    'پسا-آخرالزمانی': [
        { title: "باغبان آخرین باغ", description: "در دنیایی که توسط غبار خاکستری پوشانده شده، شما از آخرین باغ زمین که در یک گنبد شیشه‌ای محافظت می‌شود، نگهداری می‌کنید. منابع گنبد رو به اتمام است و شما باید برای یافتن راهی برای بقا، به دنیای ویران بیرون قدم بگذارید." },
        { title: "پیک رادیویی", description: "در دنیایی که شهرها از هم جدا افتاده‌اند و ارتباطات از بین رفته، شما یک پیک هستید که پیام‌های رادیویی ضبط شده را بین سکونتگاه‌های مختلف حمل می‌کنید. در آخرین ماموریت خود، یک نوار مرموز به دست شما می‌رسد که حاوی رازی است که می‌تواند سرنوشت بشریت را تغییر دهد." },
        { title: "شهر زیرزمینی", description: "بشریت پس از یک فاجعه هسته‌ای، به شهرهای زیرزمینی پناه برده است. شما یک 'کاوشگر سطح' هستید که برای یافتن منابع به دنیای مسموم و خطرناک بیرون فرستاده می‌شوید. در یکی از ماموریت‌هایتان، نشانه‌هایی از یک گروه دیگر از بازماندگان پیدا می‌کنید که در سطح زمین زندگی می‌کنند." },
        { title: "شکارچی ماشین‌ها", description: "در آینده‌ای که ماشین‌های هوشمند علیه انسان‌ها شورش کرده‌اند، شما یک شکارچی هستید که ربات‌های سرکش را برای قطعاتشان شکار می‌کنید. شما سفارشی برای شکار یک ربات افسانه‌ای دریافت می‌کنید که گفته می‌شود توانایی خودآگاهی و احساسات دارد." },
        { title: "کتابدار خاموش", description: "شما مسئول نگهداری از یک کتابخانه زیرزمینی هستید که آخرین کتاب‌های باقی‌مانده از دنیای قدیم را در خود جای داده است. یک روز، گروهی از مهاجمان که معتقدند دانش عامل نابودی جهان بوده، برای سوزاندن کتاب‌ها به پناهگاه شما حمله می‌کنند." },
        { title: "ملکه نمک", description: "بیشتر سطح زمین توسط اقیانوس‌های نمک پوشیده شده و آب شیرین با ارزش‌ترین منبع است. شما رهبر یک گروه کوچک از بازماندگان هستید که بر روی یک سکوی متحرک زندگی می‌کنند. شما شایعاتی در مورد یک 'واحه' یا منبع آب شیرین بی‌پایان می‌شنوید و تصمیم می‌گیرید گروه خود را در این سفر خطرناک رهبری کنید." }
    ],
    'کلاسیک': [
        { title: "نقشه‌کش امپراتوری فراموش‌شده", description: "شما یک نقشه‌کش هستید که توسط یک امپراتور منزوی استخدام شده‌اید تا قلمرو وسیع و ناشناخته او را نقشه برداری کنید. اما هر چه بیشتر در این سرزمین‌ها پیش می‌روید، متوجه می‌شوید که برخی مکان‌ها به عمد از نقشه‌ها پاک شده‌اند." },
        { title: "کیمیاگر پراگ", description: "در قرن ۱۶ میلادی در شهر پراگ، شما شاگرد یک کیمیاگر مشهور هستید. استاد شما در آستانه کشف سنگ فلاسفه ناپدید می‌شود. شما باید با استفاده از یادداشت‌های رمزگذاری شده او، کارش را تمام کنید و بفهمید چه بلایی سر او آمده است." },
        { title: "دزدان دریایی کارائیب", description: "شما کاپیتان یک کشتی دزدان دریایی هستید. نقشه‌ای به دست شما افتاده که محل گنج یک دزد دریایی افسانه‌ای را نشان می‌دهد. اما این نقشه نفرین شده است و خدمه شما یکی پس از دیگری دچار توهمات وحشتناکی می‌شوند. آیا این گنج ارزش این خطر را دارد؟" },
        { title: "سامورایی بی‌ارباب (رونین)", description: "در دوره فئودالی ژاپن، ارباب شما به ناحق متهم به خیانت شده و مجبور به خودکشی شده است. شما به عنوان یک رونین، قسم خورده‌اید که انتقام او را بگیرید و شرافت خاندان خود را بازگردانید. راه شما پر از مبارزات شمشیرزنی و دسیسه‌های سیاسی خواهد بود." },
        { title: "جاده ابریشم", description: "شما یک تاجر در مسیر جاده ابریشم هستید. کاروان شما حامل یک محموله بسیار با ارزش و سری است که توسط امپراتور چین به خلیفه بغداد فرستاده شده. در طول مسیر، گروه‌های مختلفی از راهزنان گرفته تا جاسوسان امپراتوری‌های رقیب، سعی در دزدیدن محموله شما دارند." },
        { title: "انقلاب فرانسه", description: "شما یک مخترع در پاریس در آستانه انقلاب فرانسه هستید. شما یک دستگاه انقلابی ساخته‌اید که می‌تواند توجه هر دو گروه سلطنت‌طلبان و انقلابیون را به خود جلب کند. شما باید تصمیم بگیرید که اختراع خود را در اختیار کدام طرف قرار دهید، تصمیمی که می‌تواند مسیر تاریخ را تغییر دهد." }
    ]
};

const gmPersonalities = ['جدی و تاریک', 'شوخ و سرگرم‌کننده', 'روایی و سینمایی', 'واقع‌گرا و بی‌رحم'];

interface NewGameCreatorProps {
    onBack: () => void;
    onStartGame: (scenario: CustomScenario, characterName: string) => void;
}

export function NewGameCreator({ onBack, onStartGame }: NewGameCreatorProps) {
    const [step, setStep] = useState(1);
    
    // State for all selections
    const [genre, setGenre] = useState<keyof typeof genres>('فانتزی');
    const [archetype, setArchetype] = useState<keyof typeof archetypes | null>(null);
    const [characterName, setCharacterName] = useState('');
    const [characterDesc, setCharacterDesc] = useState('');
    const [perk, setPerk] = useState<keyof typeof perks | null>(null);
    const [flaw, setFlaw] = useState<keyof typeof flaws | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<{title: string, description: string} | null>(null);
    const [difficulty, setDifficulty] = useState('معمولی');
    const [gmPersonality, setGmPersonality] = useState('روایی و سینمایی');


    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    
    const canProceed = () => {
        switch(step) {
            case 1: return !!genre;
            case 2: return !!archetype;
            case 3: return characterName.trim().length > 0;
            case 4: return !!perk && !!flaw;
            case 5: return !!selectedScenario;
            case 6: return true;
            default: return false;
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1: return <Step title="۱. انتخاب ژانر" description="سبک و دنیای کلی ماجراجویی خود را مشخص کنید.">
                <SelectionGrid items={genres} selected={genre} onSelect={(key) => { setGenre(key as keyof typeof genres); setSelectedScenario(null); }} columns="3" />
            </Step>
            case 2: return <Step title="۲. انتخاب کهن‌الگو" description="کلاس و هویت اصلی شخصیت خود را انتخاب کنید.">
                <SelectionGrid items={archetypes} selected={archetype} onSelect={setArchetype} columns="4" />
            </Step>
            case 3: return <Step title="۳. جزئیات شخصیت" description="به قهرمان خود یک نام و یک پیشینه (اختیاری) بدهید.">
                <div className="space-y-4">
                    <Input placeholder="نام شخصیت" value={characterName} onChange={e => setCharacterName(e.target.value)} className="text-center text-lg" />
                    <Textarea placeholder="توضیحات و پیشینه شخصیت (اختیاری)" value={characterDesc} onChange={e => setCharacterDesc(e.target.value)} rows={4} />
                </div>
            </Step>
            case 4: return <Step title="۴. انتخاب ویژگی‌ها" description="یک نقطه قوت (Perk) و یک نقطه ضعف (Flaw) انتخاب کنید تا به شخصیت خود عمق ببخشید.">
                <div className="grid md:grid-cols-2 gap-8">
                    <FeatureSelection title="نقاط قوت (Perks)" items={perks} selected={perk} onSelect={setPerk} />
                    <FeatureSelection title="نقاط ضعف (Flaws)" items={flaws} selected={flaw} onSelect={setFlaw} />
                </div>
            </Step>
            case 5: return <Step title="۵. انتخاب سناریو" description="نقطه شروع ماجراجویی خود را از بین گزینه‌های زیر انتخاب کنید.">
                <ScenarioSelection scenarios={scenarios[genre!]} selected={selectedScenario} onSelect={setSelectedScenario} />
            </Step>
            case 6: return <Step title="۶. تنظیمات نهایی" description="آخرین جزئیات را برای شخصی‌سازی کامل تجربه بازی خود تنظیم کنید.">
                <div className="space-y-6">
                    <div>
                        <Label className="text-lg font-bold text-accent">سطح دشواری</Label>
                        <RadioGroup defaultValue="معمولی" className="mt-2 grid grid-cols-3 gap-4" onValueChange={setDifficulty}>
                           {['آسان', 'معمولی', 'سخت'].map(level => (
                               <Label key={level} htmlFor={`diff-${level}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", difficulty === level && "border-accent ring-2 ring-accent")}>
                                  <RadioGroupItem value={level} id={`diff-${level}`} className="sr-only" />
                                  {level}
                               </Label>
                           ))}
                        </RadioGroup>
                    </div>
                     <div>
                        <Label htmlFor="gm-personality" className="text-lg font-bold text-accent">سبک راوی (GM)</Label>
                        <Select defaultValue='روایی و سینمایی' onValueChange={setGmPersonality}>
                            <SelectTrigger id="gm-personality" className="w-full mt-2">
                                <SelectValue placeholder="شخصیت GM را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                                {gmPersonalities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Step>
            default: return null;
        }
    };
    
    const handleStartGame = () => {
        const customScenario: CustomScenario = {
            title: selectedScenario!.title,
            character: `نام: ${characterName}, کهن‌الگو: ${archetype}, ویژگی‌ها: ${perk}، ${flaw}. توضیحات: ${characterDesc}`,
            initialItems: `بر اساس کهن‌الگوی ${archetype}`,
            storyPrompt: `ژانر: ${genre}. سبک راوی: ${gmPersonality}. سطح دشواری: ${difficulty}. سناریو: ${selectedScenario!.description}`,
        };
        onStartGame(customScenario, characterName);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                     <Button onClick={onBack} variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl sm:text-4xl font-headline text-primary">ماجراجویی جدید</h1>
                    <div className="w-10"></div>
                </div>

                <Progress value={(step / TOTAL_STEPS) * 100} className="w-full mb-8" />
                
                <div className="min-h-[400px]">
                    {renderStep()}
                </div>

                <div className="flex justify-between mt-8">
                    <Button onClick={handlePrev} disabled={step === 1} variant="outline">قبلی</Button>
                    {step < TOTAL_STEPS && <Button onClick={handleNext} disabled={!canProceed()}>بعدی</Button>}
                    {step === TOTAL_STEPS && <Button onClick={handleStartGame} className="bg-accent hover:bg-accent/90 text-accent-foreground">شروع ماجراجویی</Button>}
                </div>
            </div>
        </div>
    );
}

// Sub-components for steps

const Step = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <Card className="border-none shadow-none">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
            {children}
        </CardContent>
    </Card>
);

const SelectionGrid = ({ items, selected, onSelect, columns = "3" }: { items: any, selected: string | null, onSelect: (key: string) => void, columns?: "2" | "3" | "4" }) => {
    const columnClasses: Record<string, string> = {
        "2": "md:grid-cols-2",
        "3": "md:grid-cols-3",
        "4": "md:grid-cols-4",
    };
    
    return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", columnClasses[columns])}>
        {Object.entries(items).map(([key, value]: [string, any]) => (
            <Card 
                key={key}
                onClick={() => onSelect(key)}
                className={cn(
                    "cursor-pointer transition-all hover:shadow-accent/50 hover:shadow-md hover:-translate-y-1",
                    selected === key ? "ring-2 ring-accent" : "border-primary/20"
                )}
            >
                <CardHeader className="items-center text-center p-4">
                    <div className="p-3 bg-muted rounded-full mb-2">
                        <value.icon className="w-7 h-7 text-accent" />
                    </div>
                    <CardTitle className="text-base">{key}</CardTitle>
                    {value.description && <CardDescription className="text-xs">{value.description}</CardDescription>}
                </CardHeader>
            </Card>
        ))}
    </div>
    )
};

const FeatureSelection = ({ title, items, selected, onSelect }: { title: string, items: any, selected: string | null, onSelect: (key: string) => void }) => (
    <div>
        <h3 className="text-xl font-bold text-center mb-4 text-accent">{title}</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {Object.entries(items).map(([key, value]: [string, any]) => (
                <Card 
                    key={key} 
                    onClick={() => onSelect(key)} 
                    className={cn(
                        "cursor-pointer transition-colors", 
                        selected === key ? "bg-accent/20 border-accent" : "hover:bg-muted/50"
                    )}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <value.icon className="w-6 h-6 text-accent" />
                        <div>
                            <p className="font-bold">{key}</p>
                            <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);


const ScenarioSelection = ({ scenarios, selected, onSelect }: { scenarios: any[], selected: any | null, onSelect: (scenario: any) => void }) => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {scenarios.map((scenario, index) => (
            <Card 
                key={index}
                onClick={() => onSelect(scenario)}
                className={cn(
                    "cursor-pointer transition-all hover:border-accent",
                    selected?.title === scenario.title ? "ring-2 ring-accent" : "border-primary/20"
                )}
            >
                <CardHeader>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
            </Card>
        ))}
    </div>
);
