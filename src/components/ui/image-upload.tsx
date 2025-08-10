
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ImagePlus, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string | null>;
  className?: string;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const MAX_DIMENSION = 1024; // 1024px

export function ImageUpload({ value, onChange, onUpload, className }: ImageUploadProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Please select an image smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const optimizedFile = await optimizeImage(file);
      const publicUrl = await onUpload(optimizedFile);
      if (publicUrl) {
        onChange(publicUrl);
      }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Image Processing Failed',
            description: error.message || 'Could not process the image.',
        });
    } finally {
        setIsLoading(false);
        // Reset file input to allow re-uploading the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Could not get canvas context');
          
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject('Canvas toBlob failed');
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div
      className={cn(
        'relative group w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/50 hover:border-primary flex items-center justify-center cursor-pointer transition-colors',
        className,
        { 'border-primary': !!value }
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      ) : value ? (
        <>
          <Image src={value} alt="Preview" fill className="object-cover rounded-md" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          <ImagePlus className="h-8 w-8 mx-auto" />
          <p className="text-xs mt-1">Upload</p>
        </div>
      )}
    </div>
  );
}
