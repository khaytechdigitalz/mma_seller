"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import FileUploader from "@/components/ui/file-uploader";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2, X, ListTree, Search } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

export default function BulkProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Categories Sidenav States
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Helper to extract category list safely from response
  const extractList = useCallback((responseValue: any) => {
    const payload = responseValue?.data;
    if (!payload) return [];
    if (Array.isArray(payload.data?.data)) return payload.data.data;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  // Fetch Categories when Sidenav opens
  const handleOpenCategoriesDrawer = async () => {
    setIsCategoryDrawerOpen(true);
    
    // Only fetch if we haven't loaded them yet
    if (categories.length === 0) {
      setIsLoadingCategories(true);
      try {
        const response = await apiClient.get("categories?per_page=100");
        const list = extractList(response);
        setCategories(list);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load category IDs.");
      } finally {
        setIsLoadingCategories(false);
      }
    }
  };

  // Filtered categories based on search input
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Handle Sample CSV Template Download
  const handleDownloadSample = () => {
    const csvContent = 
      "name,sku,category_id,unit_price,current_stock,unit,description\n" +
      '"Sample T-Shirt","TSHIRT-001","1","25.00","100","pc","Comfortable cotton t-shirt for daily wear."';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "product_bulk_upload_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Sample CSV template downloaded successfully!");
  };

  // Handle CSV File Selection
  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setCsvFile(null);
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv") {
      toast.error("Please upload a valid .csv file.");
      return;
    }

    setCsvFile(file);
  };

  // Submit Bulk Upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile) {
      toast.error("Please select or drop a CSV file to upload.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      await apiClient.post("products/bulk/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Products imported successfully!");
      router.push("/products/draft");
    } catch (error: any) {
      console.error("Failed to upload bulk products:", error);
      toast.error(error?.response?.data?.message || "Failed to import products via CSV.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Bulk Product Upload" backHref="/products" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenCategoriesDrawer}
            className="gap-2 text-sm font-medium border-primary/30 text-primary hover:bg-primary/5"
          >
            <ListTree className="size-4" />
            View Category IDs
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadSample}
            className="gap-2 text-sm font-medium"
          >
            <Download className="size-4" />
            Download Sample CSV
          </Button>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-2 text-sm text-blue-900">
        <h3 className="font-semibold flex items-center gap-2 text-blue-950">
          <FileSpreadsheet className="size-4 text-primary" />
          Instructions for Bulk Upload
        </h3>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-blue-800">
          <li>Download the sample CSV template using the button above.</li>
          <li>Click <span className="font-semibold">&quot;View Category IDs&quot;</span> to look up correct category ID numbers required for your CSV.</li>
          <li>Ensure required fields like <span className="font-semibold">name</span>, <span className="font-semibold">sku</span>, <span className="font-semibold">category_id</span>, and <span className="font-semibold">unit_price</span> are included.</li>
          <li>Upload your completed CSV file below and click &quot;Upload & Import&quot;.</li>
        </ul>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Upload CSV File</h2>
          
          <FileUploader
            title="CSV Spreadsheet *"
            maxSizeText="Max size 10 MB (.csv files only)"
            accept=".csv"
            description="Drag and drop your CSV file here or click to browse"
            onFileSelect={handleFileSelect}
          />

          {/* Selected File Preview Badge */}
          {csvFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileSpreadsheet className="size-6 text-primary flex-shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium text-gray-800 truncate">{csvFile.name}</p>
                  <p className="text-xs text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCsvFile(null)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Remove file"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!csvFile || isSubmitting}
            className="min-w-36 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload & Import"
            )}
          </Button>
        </div>
      </form>

      {/* Category Reference Sidenav Drawer */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 space-y-4 animate-in slide-in-from-right">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ListTree className="size-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">Category Reference IDs</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search category name..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Category List Container */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingCategories ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-gray-500">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-sm">Loading categories...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No categories found.
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {filteredCategories.map((cat: Category) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors text-sm"
                    >
                      <span className="font-medium text-gray-800">{cat.name}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono font-semibold text-xs">
                        ID: {cat.id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}