"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteHeroItem, fetchHeroItemById, updateHeroItem } from "@/features/hero/api";
import { HeroItem } from "@/features/hero/types";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { uploadServiceImage } from "@/features/services/api";

type EditHeroState = Omit<HeroItem, "createdAt">;

export default function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hero, setHero] = useState<EditHeroState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHeroItemById(id)
      .then((data) => {
        setHero(data);
        setLoading(false);
      })
      .catch((err) => {
        setSaveError(err.message);
        setLoading(false);
      });
  }, [id]);

  const update = <K extends keyof EditHeroState>(key: K, value: EditHeroState[K]) =>
    setHero((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("src", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!hero) return;
    setSaving(true);
    setSaveError(null);
    try {
      let srcUrl = hero.src;
      if (pendingImageFile) {
        srcUrl = await uploadServiceImage(pendingImageFile);
      } else if (hero.type === "video" && !srcUrl) {
        throw new Error("Please provide a video URL or upload a file");
      }

      const patchData = { ...hero, src: srcUrl };
      await updateHeroItem(hero.id, patchData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update hero item");
    } finally {
      setSaving(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!hero) return;
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await deleteHeroItem(hero.id);
      router.push("/hero");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete hero item");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hero) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{saveError || "Hero item not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full mx-4 border border-primary/10">
            <h3 className="text-lg font-bold text-primary-dark mb-2">Delete Slide?</h3>
            <p className="text-text-secondary text-sm mb-6">Are you sure you want to delete this slide? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
            {deleting && (
              <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center max-w-sm w-full mx-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                  <p className="text-primary-dark font-medium">Deleting slide...</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting || saving}
              className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
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

              <div>
                <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Subtitle (Optional)
                </label>
                <input
                  value={hero.subtitle || ""}
                  onChange={(e) => update("subtitle", e.target.value)}
                  placeholder="e.g. The ultimate relaxation experience."
                  className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
