"use client";

import { useCallback, useState } from "react";
import { getCroppedImageFile } from "@/shared/lib/crop-image";
import { Loader2, X } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";

type ImageCropModalProps = {
  open: boolean;
  imageSrc: string;
  aspect?: number;
  title?: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
};

export function ImageCropModal({
  open,
  imageSrc,
  aspect = 21 / 9,
  title = "Crop image",
  onClose,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels);
      onConfirm(file);
      onClose();
    } catch {
      // Parent can show toast if needed
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close crop modal"
      />
      <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-primary/10 flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-primary-dark font-serif text-lg font-medium">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:bg-primary/5 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[min(50vh,360px)] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="text-text-secondary block text-xs font-semibold tracking-wider uppercase">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="accent-primary mt-2 w-full"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing || !croppedAreaPixels}
              className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cropping…
                </>
              ) : (
                "Apply crop"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
