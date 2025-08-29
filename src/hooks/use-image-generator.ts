
"use client";

import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { generateImage as generateImageFlow } from '@/ai/flows/generate-image-flow';

export function useImageGenerator(imageGenEnabled: boolean) {
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const { toast } = useToast();

    const generateImage = useCallback(async (prompt: string) => {
        if (!imageGenEnabled) return;
        setIsImageLoading(true);
        try {
          const imageUrl = await generateImageFlow(prompt);
          setCurrentImage(imageUrl);
        } catch (error) {
          console.error("Image generation failed:", error);
          toast({
            variant: "destructive",
            title: "خطا در تولید تصویر",
            description: "متاسفانه تولید تصویر با مشکل مواجه شد.",
          });
        } finally {
          setIsImageLoading(false);
        }
    }, [imageGenEnabled, toast]);

    const clearImage = useCallback(() => {
        setCurrentImage(null);
        setIsImageLoading(false);
    }, []);

    return {
        currentImage,
        isImageLoading,
        generateImage,
        clearImage,
    }
}

    