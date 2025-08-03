
'use client';

import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type QRScannerProps = {
  onScanSuccess: (data: string) => void;
  onScanError: (message: string) => void;
};

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        onScanError('Camera permission denied. Please enable it in your browser settings.');
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          const canvasContext = canvas.getContext('2d', { willReadFrequently: true });
          if(canvasContext){
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              onScanSuccess(code.data);
              return; // Stop scanning on success
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    getCameraPermission();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-md border">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="absolute inset-0 border-8 border-primary/50 rounded-md" />
      {hasCameraPermission === false && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access in your browser settings to use the QR scanner.
            </AlertDescription>
          </Alert>
        </div>
      )}
       {hasCameraPermission === null && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white">Requesting camera access...</p>
        </div>
       )}
    </div>
  );
}
