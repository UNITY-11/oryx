"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createHeroItem } from "@/features/hero/api";
import { HeroItem } from "@/features/hero/types";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Loader2,
  Save,
  Upload,
  Video,
} from "lucide-react";
import { uploadServiceImage } from "@/features/services/api";

type NewHeroState = Omit<HeroItem, "id" | "createdAt">;

const DEFAULT_STATE: NewHeroState = {
  title: "",
  type: "image",
  src: "",
  order: 1,
};

export default function NewHeroPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hero, setHero] = useState<NewHeroState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const update = <K extends keyof NewHeroState>(key: K, value: NewHeroState[K]) =>
    setHero((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("src", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let srcUrl = hero.src;
      if (pendingImageFile) {
        srcUrl = await uploadServiceImage(pendingImageFile);
      } else if (hero.type === "video" && !srcUrl) {
        throw new Error("Please provide a video URL or upload a file");
      }

      await createHeroItem({ ...hero, src: srcUrl });
      setSaved(true);
      setTimeout(() => router.push("/hero"), 1200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create hero item");
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-6 py-5 md:px-8">
          <button
            onClick={() => router.push("/hero")}
            className="text-text-secondary hover:text-primary-dark group flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Hero Section
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Creating..." : saved ? "Created!" : "Create Hero Slide"}
            </button>
          </div>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-6 md:p-8">
          {saveError && (
            <div className="mx-auto mb-6 flex max-w-5xl items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
          
          <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
            {/* LEFT — Media */}
            <div className="flex shrink-0 flex-col gap-6 lg:w-96">
              <div>
                <label className="text-text-secondary mb-3 block text-sm font-medium">
                  Slide Media
                </label>
                
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => { update("type", "image"); setPendingImageFile(null); update("src", ""); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2 ${hero.type === "image" ? "bg-primary text-white" : "bg-primary/5 text-primary-dark border border-primary/20"}`}
                  >
                    <ImageIcon className="w-4 h-4" /> Image
                  </button>
                  <button 
                    onClick={() => { update("type", "video"); setPendingImageFile(null); update("src", ""); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2 ${hero.type === "video" ? "bg-primary text-white" : "bg-primary/5 text-primary-dark border border-primary/20"}`}
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                </div>

                {hero.type === "image" ? (
                  <>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-primary/30 hover:border-primary/60 bg-primary/5 group relative w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-colors aspect-video"
                    >
                      {hero.src ? (
                        <>
                          <img src={hero.src} alt="Preview" className="h-full w-full object-cover" />
                          <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Upload className="h-6 w-6 text-white" />
                            <span className="text-xs font-medium text-white">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-primary/40 group-hover:text-primary absolute inset-0 flex flex-col items-center justify-center gap-3 transition-colors">
                          <ImageIcon className="h-10 w-10" />
                          <div className="text-center">
                            <p className="text-xs font-medium">Upload Image</p>
                            <p className="mt-0.5 text-[10px]">16:9 ratio recommended</p>
                          </div>
                          <Upload className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary">Upload Video or URL (.mp4)</label>
                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-2"
                      >
                        <Upload className="w-3 h-3" /> Upload File
                      </button>
                    </div>
                    <input
                      value={pendingImageFile ? "Ready to upload" : hero.src}
                      onChange={(e) => update("src", e.target.value)}
                      placeholder="/videos/animate-video.mp4"
                      className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                    />
                    <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleImageChange} />
                    {hero.src && !pendingImageFile && (
                      <div className="mt-2 rounded-3xl overflow-hidden aspect-video border border-primary/20">
                         <video src={hero.src} className="w-full h-full object-cover" muted autoPlay loop />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Details */}
            <div className="min-w-0 flex-1 space-y-6">
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Title (Optional)
                </label>
                <input
                  value={hero.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Welcome to ORYX"
                  className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-base font-medium focus:outline-none"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
