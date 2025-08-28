
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DynamicBackgroundProps {
  hint: string;
}

export function DynamicBackground({ hint }: DynamicBackgroundProps) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Using a seed based on the hint to get a consistent image for the same hint
    const seed = hint.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const newImageUrl = `https://picsum.photos/seed/${seed}/1920/1080`;
    
    // Preload the new image to ensure it's cached before swapping
    const img = new window.Image();
    img.src = newImageUrl;
    img.onload = () => {
      setImageUrl(newImageUrl);
    };

  }, [hint]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {imageUrl && (
        <Image
          key={imageUrl} // Change key to force re-render and restart animation
          src={imageUrl}
          alt="Dynamic game background"
          fill
          className="object-cover ken-burns"
          data-ai-hint={hint}
          priority
        />
      )}
    </div>
  );
}
