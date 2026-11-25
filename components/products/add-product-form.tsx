"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash } from "@/icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, X, Sparkles, Tag, RefreshCw, Plus, Minus, Layers, Mic, Square } from "lucide-react";

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

const getIconUrl = (iconPath?: string | null) => {
  if (!iconPath) return null;
  if (iconPath.startsWith("http://") || iconPath.startsWith("https://")) return iconPath;
  return `${STORAGE_BASE_URL}/${iconPath.replace(/^\//, "")}`;
};

interface CategoryOption {
  id: number | string;
  name: string;
  icon?: string | null;
}

interface PackageItem {
  id: number;
  package_id: string;
  name: string;
  type: string;
  length: number;
  width: number;
  height: number;
  size_unit: string;
  weight: number;
  weight_unit: string;
}

interface GalleryFile {
  id: string;
  file: File;
  previewUrl: string;
}

const generateInitialSku = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `SKU-${randomDigits}`;
};

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingShortAI, setIsGeneratingShortAI] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Voice-to-Text (Option 2: SpeechRecognition hook-style state)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);
  const recognitionRef = useRef<any>(null);
  const baseDescriptionRef = useRef<string>("");

  // Dynamic Options State
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  // Minimalist Form States
  const [name, setName] = useState("");
  const [sku, setSku] = useState<string>(() => generateInitialSku());
  const [category, setCategory] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentStock, setCurrentStock] = useState<number>(1);
  const [shortDescription, setShortDescription] = useState("");

  // Images State
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryFile[]>([]);
  const [galleryKey, setGalleryKey] = useState<number>(0);

  // Detect browser speech support & cleanup on unmount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setBrowserSupportsSpeech(Boolean(SpeechRecognitionCtor));
    }

    return () => {
      recognitionRef.current?.stop();
      galleryImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [galleryImages, thumbnailPreview]);

  const extractList = useCallback((responseValue: any) => {
    const payload = responseValue?.data;
    if (!payload) return [];
    if (Array.isArray(payload.data?.data)) return payload.data.data;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  // Fetch Categories & Packages on Mount
  useEffect(() => {
    const fetchInitialOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [catRes, packageRes] = await Promise.allSettled([
          apiClient.get("categories?per_page=100"),
          apiClient.get("packages?per_page=100"),
        ]);

        if (catRes.status === "fulfilled") {
          const list = extractList(catRes.value).map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || c.image || c.thumbnail || null,
          }));
          setCategories(list);
        } else {
          toast.error("Failed to load categories.");
        }

        if (packageRes.status === "fulfilled") {
          setPackages(extractList(packageRes.value));
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchInitialOptions();
  }, [extractList]);

  // Voice-to-Text Dictation Handler
  const handleToggleVoiceDictation = () => {
    if (isRecordingVoice) {
      recognitionRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionCtor) {
      setBrowserSupportsSpeech(false);
      toast.error("Voice dictation is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-NG";
    recognition.interimResults = true;
    recognition.continuous = true;

    baseDescriptionRef.current = shortDescription ? `${shortDescription.trim()} ` : "";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setShortDescription(`${baseDescriptionRef.current}${transcript}`.trimStart());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event?.error);
      if (event?.error !== "aborted") {
        toast.error("Unable to capture voice. Please allow microphone access.");
      }
      setIsRecordingVoice(false);
    };

    recognition.onend = () => {
      setIsRecordingVoice(false);
    };

    recognitionRef.current = recognition;
    setIsRecordingVoice(true);
    recognition.start();
    toast.info("Listening... speak your product description.");
  };

  // Stock Stepper Handlers
  const handleDecrementStock = () => {
    setCurrentStock((prev) => Math.max(0, prev - 1));
  };

  const handleIncrementStock = () => {
    setCurrentStock((prev) => prev + 1);
  };

  const handleStockInputChange = (val: string) => {
    const parsed = parseInt(val, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      setCurrentStock(0);
    } else {
      setCurrentStock(parsed);
    }
  };

  // Generate AI Short Description
  const handleGenerateShortAiDescription = async () => {
    if (!name.trim()) {
      toast.error("Please enter a product name first before generating an AI description.");
      return;
    }

    setIsGeneratingShortAI(true);
    try {
      const response = await apiClient.post("ai/generate-description", {
        product_name: name.trim(),
        description_type: "short",
      });

      const generatedDesc = response?.data?.description;
      if (generatedDesc) {
        setShortDescription(generatedDesc);
        toast.success(response?.data?.message || "Short description generated!");
      } else {
        toast.error(response?.data?.error || "Received an empty description from the AI service.");
      }
    } catch (error: any) {
      console.error("Failed to generate AI description:", error);
      toast.error(error?.response?.data?.error || "Failed to generate AI description.");
    } finally {
      setIsGeneratingShortAI(false);
    }
  };

  // Thumbnail Handler
  const handleThumbnailSelect = (file: File | null) => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnail(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  // Gallery Images Handlers
  const handleGallerySelect = (file: File | null) => {
    if (!file) return;

    if (galleryImages.length >= 5) {
      toast.error("Maximum 5 gallery images allowed.");
      return;
    }

    const newGalleryItem: GalleryFile = {
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    };

    setGalleryImages((prev) => [...prev, newGalleryItem]);
    setGalleryKey((prevKey) => prevKey + 1);
  };

  const handleRemoveGalleryImage = (id: string) => {
    setGalleryImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRecordingVoice) {
      recognitionRef.current?.stop();
      setIsRecordingVoice(false);
    }

    if (!name.trim() || !category) {
      toast.error("Please enter a product name and select a category.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("sku", sku || generateInitialSku());
    formData.append("category_id", String(category));
    formData.append("current_stock", String(currentStock));
    if (selectedPackageId) formData.append("package_id", selectedPackageId);
    if (purchasePrice !== "") formData.append("purchase_price", purchasePrice);
    if (shortDescription.trim()) formData.append("short_description", shortDescription.trim());

    if (thumbnail) formData.append("thumbnail", thumbnail);
    galleryImages.forEach((item) => {
      formData.append("gallery_images[]", item.file);
    });

    try {
      await apiClient.post("products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product created successfully!");
      router.push("/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(error?.response?.data?.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-6 border border-gray-500/20 shadow-2xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <PageHeader title="Quick Add Product" backHref="/products" />
        <div className="flex items-center gap-2 text-xs font-mono bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
          <span>{sku}</span>
          <button
            type="button"
            onClick={() => setSku(generateInitialSku())}
            className="text-gray-500 hover:text-gray-900 transition-colors"
            title="Regenerate SKU"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: Name & Purchase Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput
          label="Product Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FloatingInput
          label="Purchase Price (₦)"
          type="number"
          step="any"
          min="0"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
        />
      </div>

      {/* Row 2: Current Stock & Product Package */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Current Stock Stepper Card */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200/90 bg-gradient-to-r from-gray-50/90 to-white px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Current Stock *</span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    currentStock > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                      : "bg-amber-50 text-amber-700 border border-amber-200/70"
                  }`}
                >
                  {currentStock > 0 ? `${currentStock} in stock` : "Out of stock"}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">Available units ready for sale</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={handleDecrementStock}
              disabled={currentStock <= 0}
              className="size-8 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 disabled:opacity-35 disabled:pointer-events-none transition-all"
              aria-label="Decrease stock"
            >
              <Minus className="size-4" />
            </button>

            <input
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => handleStockInputChange(e.target.value)}
              className="w-14 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Current stock quantity"
            />

            <button
              type="button"
              onClick={handleIncrementStock}
              className="size-8 rounded-lg flex items-center justify-center bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all shadow-2xs"
              aria-label="Increase stock"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Product Package Select */}
        <CustomFloatingSelect
          label="Product Package (Specify Dimensions)"
          options={packages.map((pkg) => ({
            label: `${pkg.name} (${pkg.length}×${pkg.width}×${pkg.height} ${pkg.size_unit})`,
            value: String(pkg.id),
          }))}
          value={selectedPackageId}
          onChange={setSelectedPackageId}
        />
      </div>

      {/* Category Radio Cards with Icon */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-900">
          Select Category *
        </label>

        {isLoadingOptions ? (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No categories available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const catValue = String(cat.id);
              const isSelected = category === catValue;
              const iconUrl = getIconUrl(cat.icon);

              return (
                <label
                  key={catValue}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="product_category"
                    value={catValue}
                    checked={isSelected}
                    onChange={() => setCategory(catValue)}
                    className="sr-only"
                  />

                  <div className="size-9 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200/70">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt={cat.name}
                        width={24}
                        height={24}
                        className="size-6 object-contain"
                        unoptimized
                      />
                    ) : (
                      <Tag className="size-4 text-gray-500" />
                    )}
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isSelected ? "text-primary" : "text-gray-800"
                    }`}
                  >
                    {cat.name}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Images (Thumbnail & Gallery) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Product Images</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <FileUploader
              title="Main Image (Thumbnail)"
              maxSizeText="Max 3.1 MB (JPEG, PNG, WEBP)"
              onFileSelect={handleThumbnailSelect}
            />
            {thumbnailPreview && (
              <div className="relative size-16 rounded-lg border border-gray-200 overflow-hidden group">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleThumbnailSelect(null)}
                  className="absolute top-1 right-1 bg-red-500/90 text-white p-0.5 rounded-full"
                  title="Remove image"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <FileUploader
              key={galleryKey}
              title={`Additional Images (${galleryImages.length}/5)`}
              maxSizeText="Max 3.1 MB each"
              onFileSelect={handleGallerySelect}
            />
          </div>
        </div>

        {galleryImages.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-1">
            {galleryImages.map((item) => (
              <div
                key={item.id}
                className="relative group size-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
              >
                <Image
                  src={item.previewUrl}
                  alt="Gallery Image"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(item.id)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="Delete Image"
                >
                  <Trash className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Short Description + Voice-to-Text & AI Generator */}
      <div className="space-y-2">
        <FloatingTextarea
          label="Short Description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="h-24"
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {browserSupportsSpeech && (
            <Button
              type="button"
             // variant={isRecordingVoice ? "destructive" : "outline"}
              size="sm"
              onClick={handleToggleVoiceDictation}
              className="gap-1.5 text-xs font-medium"
            >
              {isRecordingVoice ? (
                <>
                  <Square className="size-3.5 fill-current animate-pulse" />
                  Stop Voice
                </>
              ) : (
                <>
                  <Mic className="size-3.5 text-white" />
                  Voice to Text
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateShortAiDescription}
            disabled={isGeneratingShortAI}
            className="gap-1.5 text-xs font-medium"
          >
            {isGeneratingShortAI ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5 text-primary" />
            )}
            {isGeneratingShortAI ? "Generating..." : "Generate AI Description"}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Product"
          )}
        </Button>
      </div>
    </form>
  );
}