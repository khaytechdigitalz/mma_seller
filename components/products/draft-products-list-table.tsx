"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2 as Trash,
  MoreVertical,
  X,
  Sparkles,
  Loader2,
  Upload,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import DeleteModal from "@/components/ui/delete-modal";

export interface CategoryItem {
  id: number;
  name: string;
}

export interface ProductDraftItem {
  id: number;
  seller_id: number;
  category_id: number;
  name: string;
  sku: string;
  unit_price: number;
  current_stock: number;
  unit: string;
  description: string;
  short_description?: string;
  thumbnail?: string | null;
  category?: { id: number; name: string } | null;
  created_at: string;
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const formatCurrency = (sales: string | number) => {
  const num = typeof sales === "string" ? parseFloat(sales) : sales;
  if (isNaN(num)) return "₦0";
  
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);

  return `₦${formattedNumber}`;
};

export default function DraftProductsPage() {
  const [products, setProducts] = useState<ProductDraftItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Categories list for dropdown selection
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Edit / Publish Sidenav Drawer states
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeDraft, setActiveDraft] = useState<ProductDraftItem | null>(null);
  
  // Form fields for editing & publishing
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [unitPrice, setUnitPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [unit, setUnit] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

  const extractList = useCallback((responseValue: any) => {
    const payload = responseValue?.data;
    if (!payload) return [];
    if (Array.isArray(payload.data?.data)) return payload.data.data;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  const extractPaginationData = (responseValue: any) => {
    const payload = responseValue?.data;
    if (!payload) return { data: [], pagination: null };
    
    const pData = payload.data || payload;
    return {
      data: Array.isArray(pData.data) ? pData.data : (Array.isArray(pData) ? pData : []),
      pagination: {
        current_page: pData.current_page || 1,
        last_page: pData.last_page || 1,
        per_page: pData.per_page || 15,
        total: pData.total || 0,
      }
    };
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get("categories?per_page=100");
      setCategories(extractList(response));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [extractList]);

  const fetchDrafts = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`products/draft/products?page=${page}`);
      const { data, pagination: pagData } = extractPaginationData(response);
      setProducts(data);
      setPagination(pagData);
    } catch (error: any) {
      console.error("Failed to fetch product drafts:", error);
      toast.error(error?.response?.data?.message || "Failed to load product drafts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts(currentPage);
    fetchCategories();
  }, [currentPage, fetchDrafts, fetchCategories]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(products.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllSelected =
    products.length > 0 && selectedRows.length === products.length;

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await apiClient.delete(`draft/products/${productToDelete}`);
      toast.success("Draft deleted successfully.");
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
      fetchDrafts(currentPage);
    } catch (error: any) {
      console.error("Failed to delete draft:", error);
      toast.error(error?.response?.data?.message || "Failed to delete product draft.");
    }
  };

  // Open Edit & Publish Drawer populated with item values
  const handleOpenEditDrawer = (product: ProductDraftItem) => {
    setActiveDraft(product);
    setName(product.name || "");
    setSku(product.sku || "");
    setCategoryId(product.category_id || "");
    setUnitPrice(product.unit_price ? product.unit_price.toString() : "");
    setCurrentStock(product.current_stock ? product.current_stock.toString() : "");
    setUnit(product.unit || "");
    setShortDescription(product.short_description || "");
    setDescription(product.description || "");
    setThumbnailFile(null);
    setThumbnailPreview(product.thumbnail || null);
    setIsEditDrawerOpen(true);
  };

  // Handle Thumbnail File Selection
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Trigger AI Endpoint generation for descriptions
  const handleAIGenerate = async (type: "short_description" | "description") => {
    if (!activeDraft) return;

    setIsGeneratingAI(type);
    try {
      const response = await apiClient.post("ai/generate-description", {
        product_name: name || activeDraft.name,
        description_type: type,
      });

      const generatedText = response?.data?.data?.content || response?.data?.content;
      if (generatedText) {
        if (type === "short_description") {
          setShortDescription(generatedText);
        } else {
          setDescription(generatedText);
        }
        toast.success("AI content generated successfully!");
      } else {
        toast.error("Failed to extract AI generated text.");
      }
    } catch (error: any) {
      console.error("AI Generation error:", error);
      toast.error(error?.response?.data?.message || "Failed to generate AI content.");
    } finally {
      setIsGeneratingAI(null);
    }
  };

  // Submit Publish Form with all fields
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDraft) return;

    setIsPublishing(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    if (categoryId !== "") {
      formData.append("category_id", categoryId.toString());
    }
    formData.append("unit_price", unitPrice);
    formData.append("current_stock", currentStock);
    formData.append("unit", unit);
    formData.append("short_description", shortDescription);
    formData.append("description", description);
    
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    try {
      await apiClient.post(`products/draft/publish/${activeDraft.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product published successfully!");
      setIsEditDrawerOpen(false);
      fetchDrafts(currentPage);
    } catch (error: any) {
      console.error("Failed to publish draft:", error);
      toast.error(error?.response?.data?.message || "Failed to publish product.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-500/20 shadow-xs">
      {/* Header Container */}
      <div className="p-4 sm:p-6 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-bold text-gray-900 leading-7">
            Draft Product List
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and publish your bulk uploaded product drafts.
          </p>
        </div>
      </div>

      {/* Product Data Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100/70 hover:bg-gray-100/70 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={index}
                className="border-b border-gray-500/20 animate-pulse"
              >
                <TableCell className="pl-6"><div className="h-4 w-4 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded"></div></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-14 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-10 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-10 bg-gray-200 rounded"></div></TableCell>
                <TableCell className="pr-6 text-right"><div className="h-6 w-8 bg-gray-200 rounded ml-auto"></div></TableCell>
              </TableRow>
            ))
          ) : products.length > 0 ? (
            products.map((product) => {
              const imageSrc = product.thumbnail
                ? product.thumbnail.startsWith("http")
                  ? product.thumbnail
                  : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${product.thumbnail}`
                : null;

              return (
                <TableRow
                  key={product.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(product.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(product.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600 whitespace-nowrap">
                    #{product.sku || product.id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg relative overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={product.name || "Product"}
                            width={32}
                            height={32}
                            className="rounded-lg object-cover size-full"
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400 font-semibold">IMG</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-800 font-medium truncate max-w-[220px]">
                        {product.name || "Untitled Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 whitespace-nowrap">
                    <Badge variant="default" className="font-mono text-xs bg-gray-50">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-primary whitespace-nowrap">
                    {formatCurrency(product.unit_price)}
                  </TableCell>
                  <TableCell className="text-gray-600 whitespace-nowrap">
                    {product.current_stock}
                  </TableCell> 
                  <TableCell className="text-gray-500 text-xs whitespace-nowrap">
                    {product.unit || "-"}
                  </TableCell>

                  <TableCell className="pr-6 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-100">
                          <MoreVertical className="size-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white shadow-xl rounded-xl border border-gray-100 p-1">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditDrawer(product)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <Pencil className="size-4 text-gray-500" />
                          Edit & Publish
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 border-gray-100" />

                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash className="size-4 text-red-500" />
                          Delete Draft
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                No product drafts found. Upload via CSV to populate drafts.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Container */}
      {pagination && pagination.total > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-gray-500">
            Showing page <span className="font-medium text-gray-700">{pagination.current_page}</span> of <span className="font-medium text-gray-700">{pagination.last_page}</span> ({pagination.total} total drafts)
          </p>
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Edit and Publish Sidenav Drawer */}
      {isEditDrawerOpen && activeDraft && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 animate-in slide-in-from-right overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit & Publish Draft</h2>
                <p className="text-xs text-gray-500 truncate max-w-[320px]">ID: #{activeDraft.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Publish Form */}
            <form onSubmit={handlePublishSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter product name"
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* SKU and Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. TSHIRT-001"
                      className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                      required
                      className="w-full p-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price, Stock, Unit Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800">Price (₦) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800">Stock *</label>
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(e.target.value)}
                      required
                      placeholder="0"
                      className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. pc, kg"
                      className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800">Product Thumbnail</label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                      {thumbnailPreview ? (
                        <Image
                          src={thumbnailPreview.startsWith("blob:") ? thumbnailPreview : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${thumbnailPreview}`}
                          alt="Thumbnail preview"
                          width={64}
                          height={64}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <Upload className="size-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <Upload className="size-4" />
                        Choose Image
                      </label>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Short Description</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGenerate("short_description")}
                      disabled={isGeneratingAI === "short_description"}
                      className="h-7 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10"
                    >
                      {isGeneratingAI === "short_description" ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Sparkles className="size-3" />
                      )}
                      Generate AI
                    </Button>
                  </div>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief summary of the product..."
                    className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {/* Full Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Full Description</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGenerate("description")}
                      disabled={isGeneratingAI === "description"}
                      className="h-7 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10"
                    >
                      {isGeneratingAI === "description" ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Sparkles className="size-3" />
                      )}
                      Generate AI
                    </Button>
                  </div>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description, specifications, features..."
                    className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

              </div>

              {/* Drawer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDrawerOpen(false)}
                  disabled={isPublishing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPublishing}
                  className="min-w-36 gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Product"
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}