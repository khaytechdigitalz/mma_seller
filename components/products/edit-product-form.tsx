"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { VideoCamera, Trash } from "@/icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import StatusSelect, { Option } from "@/components/ui/status-select";
import FileUploader from "@/components/ui/file-uploader";
import Switch from "@/components/ui/switch";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

// Helper to assemble asset URLs for remote pre-filled images
const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL;
  

const getFullImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_BASE_URL}/${path.replace(/^\//, "")}`;
};

// Interface definitions
interface SelectOption {
  label: string;
  value: string;
}

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
}

interface AttributeItem {
  id: number;
  name: string;
  type: string;
  values: AttributeValue[];
}

interface SelectedAttribute {
  attribute_id: number;
  value_ids: number[];
}

interface ExistingGalleryImage {
  id: string; // Remote path or identifier
  url: string; // Renderable URL
  isExisting: true;
}

interface NewGalleryImage {
  id: string;
  file: File;
  previewUrl: string;
  isExisting: false;
}

type GalleryItem = ExistingGalleryImage | NewGalleryImage;

const productTypeOptions: SelectOption[] = [
  { label: "Physical", value: "physical" },
  { label: "Digital", value: "digital" },
];

const taxTypeOptions: SelectOption[] = [
  { label: "Flat ($)", value: "flat" },
  { label: "Percentage (%)", value: "percent" },
];

const discountTypeOptions: SelectOption[] = [
  { label: "Flat ($)", value: "flat" },
  { label: "Percentage (%)", value: "percent" },
];

const stockStatusOptions: SelectOption[] = [
  { label: "In Stock", value: "in_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
  { label: "Backorder", value: "backorder" },
];

const statusOptions: Option[] = [
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Options State
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [subcategories, setSubcategories] = useState<SelectOption[]>([]);
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);
  const [isSubcategoryLoading, setIsSubcategoryLoading] = useState(false);

  // --- Form States ---
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [published, setPublished] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isTodaysDeal, setIsTodaysDeal] = useState<boolean>(false);

  // Basic Info
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [productType, setProductType] = useState("physical");
  const [brand, setBrand] = useState("");
  const [seller, setSeller] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Tags State
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Pricing & Stock
  const [unitPrice, setUnitPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [tax, setTax] = useState("");
  const [taxType, setTaxType] = useState("flat");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [currentStock, setCurrentStock] = useState("10");
  const [minimumOrderQty, setMinimumOrderQty] = useState("1");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [stockStatus, setStockStatus] = useState("in_stock");
  const [shippingCost, setShippingCost] = useState("0");
  const [multiplyQty, setMultiplyQty] = useState(false);

  // Attributes State
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([]);

  // Files State
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [galleryKey, setGalleryKey] = useState<number>(0);
  
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [existingDigitalFile, setExistingDigitalFile] = useState<string | null>(null);

  // SEO Meta State
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaImage, setMetaImage] = useState<File | null>(null);
  const [metaImagePreview, setMetaImagePreview] = useState<string | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      galleryImages.forEach((img) => {
        if (!img.isExisting) URL.revokeObjectURL(img.previewUrl);
      });
      if (thumbnailPreview && !thumbnailPreview.startsWith("http")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [galleryImages, thumbnailPreview]);

  // Helper safely extracts inner array data
  const extractList = useCallback((responseValue: any) => {
    const payload = responseValue?.data;
    if (!payload) return [];
    if (Array.isArray(payload.data?.data)) return payload.data.data;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  // Fetch Dropdown Options on Mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, brandRes, attrRes] = await Promise.allSettled([
          apiClient.get("categories?per_page=100"),
          apiClient.get("brands?per_page=500"),
          apiClient.get("attributes?per_page=100"),
        ]);

        if (catRes.status === "fulfilled") {
          setCategories(
            extractList(catRes.value).map((c: any) => ({
              label: c.name,
              value: String(c.id),
            }))
          );
        }

        if (brandRes.status === "fulfilled") {
          setBrands(
            extractList(brandRes.value).map((b: any) => ({
              label: b.name,
              value: String(b.id),
            }))
          );
        }

        

        if (attrRes.status === "fulfilled") {
          setAttributes(extractList(attrRes.value));
        }
      } catch (err) {
        console.error("Failed to load select options:", err);
      }
    };

    fetchOptions();
  }, [extractList]);

  // Fetch Product Details and Prefill Form
  useEffect(() => {
    if (!productId) return;

    const fetchProductDetails = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await apiClient.get(`products/${productId}`);
        const data = response?.data?.data;

        if (!data) {
          toast.error("Product details not found.");
          router.push("/products");
          return;
        }

        // Prefill Form Fields
        setName(data.name || "");
        setSku(data.sku || "");
        setUnit(data.unit || "");
        setCategory(data.category_id ? String(data.category_id) : "");
        setSubcategory(data.sub_category_id ? String(data.sub_category_id) : "");
        setProductType(data.product_type || "physical");
        setBrand(data.brand_id ? String(data.brand_id) : "");
        setSeller(data.seller_id ? String(data.seller_id) : "");
        setShortDescription(data.short_description || "");
        setDescription(data.description || "");
        setTags(Array.isArray(data.tags) ? data.tags : []);

        // Pricing & Inventory
        setUnitPrice(data.unit_price !== undefined ? String(data.unit_price) : "");
        setPurchasePrice(data.purchase_price !== undefined ? String(data.purchase_price) : "");
        setTax(data.tax !== undefined ? String(data.tax) : "");
        setTaxType(data.tax_type || "flat");
        setDiscount(data.discount !== undefined ? String(data.discount) : "");
        setDiscountType(data.discount_type || "flat");
        setCurrentStock(data.current_stock !== undefined ? String(data.current_stock) : "0");
        setMinimumOrderQty(data.minimum_order_qty !== undefined ? String(data.minimum_order_qty) : "1");
        setLowStockThreshold(data.low_stock_threshold !== undefined ? String(data.low_stock_threshold) : "5");
        setStockStatus(data.stock_status || "in_stock");
        setShippingCost(data.shipping_cost !== undefined ? String(data.shipping_cost) : "0");
        setMultiplyQty(Boolean(data.multiply_qty));

        // Visibility & Status
        setPublished(Boolean(data.published));
        setIsFeatured(Boolean(data.is_featured));
        setIsTodaysDeal(Boolean(data.is_todays_deal));
        
        const currentStatusOption = statusOptions.find(
          (opt) => opt.value === data.status
        );
        if (currentStatusOption) setStatus(currentStatusOption);

        // Images & Files
        if (data.thumbnail) {
          setThumbnailPreview(getFullImageUrl(data.thumbnail));
        }

        if (Array.isArray(data.images)) {
          const existingGallery: ExistingGalleryImage[] = data.images.map((imgPath: string) => ({
            id: imgPath,
            url: getFullImageUrl(imgPath) || "",
            isExisting: true,
          }));
          setGalleryImages(existingGallery);
        }

        if (data.digital_file) {
          setExistingDigitalFile(data.digital_file);
        }

        // SEO Meta
        setMetaTitle(data.meta_title || "");
        setMetaDescription(data.meta_description || "");
        if (data.meta_image) {
          setMetaImagePreview(getFullImageUrl(data.meta_image));
        }

        // Attributes / Variations
        if (Array.isArray(data.variations)) {
          const prefilledAttrs: SelectedAttribute[] = data.variations.map((v: any) => ({
            attribute_id: v.attribute_id,
            value_ids: Array.isArray(v.attribute_value_ids)
              ? v.attribute_value_ids.map((id: any) => Number(id))
              : [],
          }));
          setSelectedAttributes(prefilledAttrs);
        }
      } catch (err: any) {
        console.error("Failed to load product details:", err);
        toast.error("Could not load product details.");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [productId, router]);

  // Fetch Subcategories when Category changes
  useEffect(() => {
    if (!category) {
      setSubcategories([]);
      setSubcategory("");
      return;
    }

    const fetchSubcategories = async () => {
      setIsSubcategoryLoading(true);
      try {
        const response = await apiClient.get("subcategories", {
          params: { category_id: category },
        });
        const subData = extractList(response);
        setSubcategories(
          subData.map((sc: any) => ({
            label: sc.name,
            value: String(sc.id),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
      } finally {
        setIsSubcategoryLoading(false);
      }
    };

    fetchSubcategories();
  }, [category, extractList]);

  // Thumbnail Handler
  const handleThumbnailSelect = (file: File | null) => {
    if (thumbnailPreview && !thumbnailPreview.startsWith("http")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
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

    const newGalleryItem: NewGalleryImage = {
      id: `${file.name}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isExisting: false,
    };

    setGalleryImages((prev) => [...prev, newGalleryItem]);
    setGalleryKey((prevKey) => prevKey + 1);
  };

  const handleRemoveGalleryImage = (id: string) => {
    setGalleryImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && !target.isExisting) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,|,$/g, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Attribute Handlers
  const handleAddAttribute = (attrId: string) => {
    const id = Number(attrId);
    if (!id || selectedAttributes.some((a) => a.attribute_id === id)) return;
    setSelectedAttributes([...selectedAttributes, { attribute_id: id, value_ids: [] }]);
  };

  const handleRemoveAttribute = (attrId: number) => {
    setSelectedAttributes(selectedAttributes.filter((a) => a.attribute_id !== attrId));
  };

  const handleToggleAttributeValue = (attrId: number, valueId: number, isSingleSelect: boolean) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) => {
        if (attr.attribute_id !== attrId) return attr;
        if (isSingleSelect) {
          return { ...attr, value_ids: [valueId] };
        }
        const exists = attr.value_ids.includes(valueId);
        return {
          ...attr,
          value_ids: exists
            ? attr.value_ids.filter((v) => v !== valueId)
            : [...attr.value_ids, valueId],
        };
      })
    );
  };

  // Submit Handler (Update API endpoint)
  const handleSubmit = async () => {
    if (!name || !category || !unitPrice || !sku) {
      toast.error("Please fill in all required fields (Name, Category, SKU, Unit Price).");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    // Use Method Spoofing if backend uses POST for FormData updates
    formData.append("_method", "POST");

    // Basic Fields
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("category_id", category);
    if (subcategory) formData.append("sub_category_id", subcategory);
    if (brand) formData.append("brand_id", brand);
    if (seller) formData.append("seller_id", seller);
    if (productType) formData.append("product_type", productType);
    if (unit) formData.append("unit", unit);
    if (shortDescription) formData.append("short_description", shortDescription);
    if (description) formData.append("description", description);

    // Tags
    tags.forEach((tag, idx) => {
      formData.append(`tags[${idx}]`, tag);
    });

    // Pricing & Inventory
    formData.append("unit_price", unitPrice);
    if (purchasePrice) formData.append("purchase_price", purchasePrice);
    if (tax) formData.append("tax", tax);
    if (taxType) formData.append("tax_type", taxType);
    if (discount) formData.append("discount", discount);
    if (discountType) formData.append("discount_type", discountType);

    if (currentStock) formData.append("current_stock", currentStock);
    if (minimumOrderQty) formData.append("minimum_order_qty", minimumOrderQty);
    if (lowStockThreshold) formData.append("low_stock_threshold", lowStockThreshold);
    if (stockStatus) formData.append("stock_status", stockStatus);
    if (shippingCost) formData.append("shipping_cost", shippingCost);
    formData.append("multiply_qty", multiplyQty ? "1" : "0");

    // Flags & Status
    formData.append("is_featured", isFeatured ? "1" : "0");
    formData.append("is_todays_deal", isTodaysDeal ? "1" : "0");
    formData.append("published", published ? "1" : "0");
    if (status?.value) formData.append("status", String(status.value));

    // Standalone Key-Value Attributes
    selectedAttributes.forEach((attr, attrIdx) => {
      attr.value_ids.forEach((valId, valIdx) => {
        formData.append(`attributes[${attrIdx}][${valIdx}]`, String(valId));
      });
    });

    // File Uploads & Kept Existing Files
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    // Process Gallery: append new binary files & track remaining existing image paths
    galleryImages.forEach((item) => {
      if (!item.isExisting) {
        formData.append("gallery_images[]", item.file);
      } else {
        formData.append("existing_gallery_images[]", item.id);
      }
    });

    if (digitalFile) formData.append("digital_file", digitalFile);

    // SEO Meta
    if (metaTitle) formData.append("meta_title", metaTitle);
    if (metaDescription) formData.append("meta_description", metaDescription);
    if (metaImage) formData.append("meta_image", metaImage);

    try {
      await apiClient.post(`products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully!");
      router.push("/products");
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error(error?.response?.data?.message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const unselectedAttributes = attributes.filter(
    (attr) => !selectedAttributes.some((sa) => sa.attribute_id === attr.id)
  );

  if (isLoadingProduct) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[400px] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Edit Product" backHref="/products" />
        <div className="w-32">
          <StatusSelect value={status} onChange={setStatus} options={statusOptions} />
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
        <h2 className="text-lg font-bold text-gray-900 mb-4 sm:mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FloatingInput
            label="Product Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FloatingInput
            label="SKU *"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
          <CustomFloatingSelect
            label="Category *"
            options={categories}
            value={category}
            onChange={setCategory}
          />
          <div className="relative">
            <CustomFloatingSelect
              label={isSubcategoryLoading ? "Loading..." : "Subcategory"}
              options={subcategories}
              value={subcategory}
              onChange={setSubcategory}
            />
            {isSubcategoryLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            )}
          </div>
          <CustomFloatingSelect
            label="Product Type"
            options={productTypeOptions}
            value={productType}
            onChange={setProductType}
          />
          <FloatingInput
            label="Unit (e.g. kg, pc, box)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <CustomFloatingSelect
            label="Brand"
            options={brands}
            value={brand}
            onChange={setBrand}
          /> 
        </div>

        <div className="mt-4 sm:mt-6 space-y-4">
          <FloatingTextarea
            label="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="h-24"
          />
          <FloatingTextarea
            label="Full Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-36"
          />
        </div>
      </div>

      {/* Media Uploads */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Media</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Thumbnail Uploader */}
          <div className="space-y-3">
            <FileUploader
              title="Thumbnail Photo *"
              maxSizeText="Max size 3.1 MB (JPEG, PNG, WEBP)"
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
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Gallery Images Uploader with Reset Key */}
          <div className="space-y-3">
            <FileUploader
              key={galleryKey}
              title={`Gallery Images (${galleryImages.length}/5)`}
              maxSizeText="Max size 3.1 MB each"
              onFileSelect={handleGallerySelect}
            />
          </div>

          {/* Digital File Uploader */}
          {productType === "digital" && (
            <div className="space-y-2">
              <FileUploader
                title="Digital Product File"
                maxSizeText="Max size 50 MB (ZIP, RAR, PDF, MP4)"
                accept=".pdf,.zip,.rar,.mp3,.mp4,.epub"
                description="Allowed *.PDF, .ZIP, .RAR, .MP4"
                icon={<VideoCamera />}
                onFileSelect={(file) => setDigitalFile(file)}
              />
              {existingDigitalFile && !digitalFile && (
                <p className="text-xs text-gray-500 truncate">
                  Current: <span className="font-mono text-gray-700">{existingDigitalFile}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Visual Compact Gallery Grid */}
        {galleryImages.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-600">
              Gallery Previews
            </span>
            <div className="flex flex-wrap gap-3">
              {galleryImages.map((item) => (
                <div
                  key={item.id}
                  className="relative group size-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0"
                >
                  <Image
                    src={item.isExisting ? item.url : item.previewUrl}
                    alt="Gallery Image"
                    fill
                    className="object-cover"
                    unoptimized

                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-transform transform hover:scale-105"
                      title="Delete Image"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-0 inset-x-0 truncate text-[9px] bg-black/60 text-white px-1 py-0.5 text-center">
                    {item.isExisting ? "Existing" : item.file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attributes Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Product Attributes</h2>
          {unselectedAttributes.length > 0 && (
            <div className="w-56">
              <CustomFloatingSelect
                label="Add Attribute"
                options={unselectedAttributes.map((a) => ({
                  label: a.name,
                  value: String(a.id),
                }))}
                value=""
                onChange={handleAddAttribute}
              />
            </div>
          )}
        </div>

        {selectedAttributes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No attributes added yet.</p>
        ) : (
          <div className="space-y-4">
            {selectedAttributes.map((selectedAttr) => {
              const attrDetail = attributes.find((a) => a.id === selectedAttr.attribute_id);
              if (!attrDetail) return null;

              const isSingleSelect =
                attrDetail.type === "radio" || attrDetail.type === "dropdown";

              return (
                <div
                  key={attrDetail.id}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">
                      {attrDetail.name}{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        ({attrDetail.type})
                      </span>
                    </span>
                    <Button
                      variant="icon"
                      size="xs"
                      onClick={() => handleRemoveAttribute(attrDetail.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {attrDetail.values?.map((val) => {
                      const isSelected = selectedAttr.value_ids.includes(val.id);
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() =>
                            handleToggleAttributeValue(attrDetail.id, val.id, isSingleSelect)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
        <h2 className="text-lg font-bold text-gray-900 mb-4 sm:mb-6">Tags</h2>
        <div className="space-y-4">
          <FloatingInput
            label="Type tag and press Enter or comma"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border border-gray-300 bg-gray-50 text-gray-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Pricing & Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FloatingInput
            label="Unit Price ($) *"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
          <FloatingInput
            label="Purchase Price ($)"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <FloatingInput
              label="Discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <CustomFloatingSelect
              label="Type"
              options={discountTypeOptions}
              value={discountType}
              onChange={setDiscountType}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FloatingInput
              label="Tax"
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
            />
            <CustomFloatingSelect
              label="Type"
              options={taxTypeOptions}
              value={taxType}
              onChange={setTaxType}
            />
          </div>
          <FloatingInput
            label="Current Stock"
            type="number"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
          />
          <FloatingInput
            label="Min Order Qty"
            type="number"
            value={minimumOrderQty}
            onChange={(e) => setMinimumOrderQty(e.target.value)}
          />
          <FloatingInput
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
          <CustomFloatingSelect
            label="Stock Status"
            options={stockStatusOptions}
            value={stockStatus}
            onChange={setStockStatus}
          />
          <FloatingInput
            label="Shipping Cost ($)"
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
          />
        </div>
      </div>

      {/* SEO Meta */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">SEO Meta Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            label="Meta Title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
          <div className="space-y-2">
            <FileUploader
              title="Meta Image"
              maxSizeText="Max size 2.0 MB"
              onFileSelect={(file) => setMetaImage(file)}
            />
            {metaImagePreview && (
              <div className="relative size-12 rounded-lg border border-gray-200 overflow-hidden">
                <Image
                  src={metaImagePreview}
                  alt="Meta Image Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
        <FloatingTextarea
          label="Meta Description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          className="h-24"
        />
      </div>

      {/* Visibility & Flags */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Visibility & Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Published</span>
            <Switch checked={published} onChange={setPublished} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Featured</span>
            <Switch checked={isFeatured} onChange={setIsFeatured} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Today's Deal</span>
            <Switch checked={isTodaysDeal} onChange={setIsTodaysDeal} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Multiply Qty</span>
            <Switch checked={multiplyQty} onChange={setMultiplyQty} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 sm:pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={() => router.push("/products")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            "Update Product"
          )}
        </Button>
      </div>
    </div>
  );
}