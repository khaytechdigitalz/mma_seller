"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import SearchInput from "@/components/common/search-input";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProductFilterValues {
  search?: string;
  category_id?: string;
  sub_category_id?: string;
  brand_id?: string;
  seller_id?: string;
  status?: string;
  published?: string;
  is_featured?: string;
  per_page?: number;
}

interface ProductFilterBarProps {
  onFilterChange: (filters: ProductFilterValues) => void;
  initialFilters?: ProductFilterValues;
}

const statusOptions: Option[] = [
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

const publishedOptions: Option[] = [
  { label: "Published", value: "1" },
  { label: "Unpublished", value: "0" },
];

const featuredOptions: Option[] = [
  { label: "Featured", value: "1" },
  { label: "Non-Featured", value: "0" },
];

const perPageOptions: Option[] = [
  { label: "10 per page", value: "10" },
  { label: "15 per page", value: "15" },
  { label: "25 per page", value: "25" },
  { label: "50 per page", value: "50" },
  { label: "100 per page", value: "100" },
];

export default function ProductFilterBar({
  onFilterChange,
  initialFilters = {},
}: ProductFilterBarProps) {
  // Search State
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters.search || "");

  // Dynamic Options State
  const [categories, setCategories] = useState<Option[]>([]);
  const [subcategories, setSubcategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);

  // Selected Option States
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Option | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Option | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);
  const [selectedPublished, setSelectedPublished] = useState<Option | null>(null);
  const [selectedFeatured, setSelectedFeatured] = useState<Option | null>(null);
  const [selectedPerPage, setSelectedPerPage] = useState<Option | null>(
    perPageOptions.find((opt) => opt.value === String(initialFilters.per_page || 15)) || perPageOptions[1]
  );

  // Loading States
  const [isSubcategoryLoading, setIsSubcategoryLoading] = useState<boolean>(false);

 // Fetch Categories, Brands, and Sellers on Mount
useEffect(() => {
  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.allSettled([
        apiClient.get("categories?per_page=100"),
        apiClient.get("brands?per_page=500"),
      ]);

      // Helper to safely extract paginated array data
      const extractList = (responseValue: any) => {
        const payload = responseValue?.data;
        if (!payload) return [];
        // Handles nested pagination: response.data.data.data
        if (Array.isArray(payload.data?.data)) return payload.data.data;
        // Handles single nesting: response.data.data
        if (Array.isArray(payload.data)) return payload.data;
        // Handles flat array: response.data
        if (Array.isArray(payload)) return payload;
        return [];
      };

      if (categoriesRes.status === "fulfilled") {
        const catList = extractList(categoriesRes.value);
        setCategories(
          catList.map((c: { id: number | string; name: string }) => ({
            label: c.name,
            value: String(c.id),
          }))
        );
      }

      if (brandsRes.status === "fulfilled") {
        const brandList = extractList(brandsRes.value);
        setBrands(
          brandList.map((b: { id: number | string; name: string }) => ({
            label: b.name,
            value: String(b.id),
          }))
        );
      }

    
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  };

  fetchDropdownData();
}, []);

  // Fetch Subcategories when Category changes
  useEffect(() => {
    if (!selectedCategory?.value) {
      setSubcategories([]);
      setSelectedSubCategory(null);
      return;
    }

    const fetchSubcategories = async () => {
      setIsSubcategoryLoading(true);
      try {
        const response = await apiClient.get("subcategories", {
          params: { category_id: String(selectedCategory.value) },
        });

        const subData = response.data?.data || response.data || [];
        setSubcategories(
          Array.isArray(subData)
            ? subData.map((sc: { id: number | string; name: string }) => ({
                label: sc.name,
                value: String(sc.id),
              }))
            : []
        );
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
      } finally {
        setIsSubcategoryLoading(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Debounced Filter Emissions
  useEffect(() => {
    const handler = setTimeout(() => {
      const activeFilters: ProductFilterValues = {
        search: searchTerm || undefined,
        category_id: selectedCategory?.value ? String(selectedCategory.value) : undefined,
        sub_category_id: selectedSubCategory?.value ? String(selectedSubCategory.value) : undefined,
        brand_id: selectedBrand?.value ? String(selectedBrand.value) : undefined,
        seller_id: selectedSeller?.value ? String(selectedSeller.value) : undefined,
        status: selectedStatus?.value ? String(selectedStatus.value) : undefined,
        published: selectedPublished?.value ? String(selectedPublished.value) : undefined,
        is_featured: selectedFeatured?.value ? String(selectedFeatured.value) : undefined,
        per_page: selectedPerPage ? Number(selectedPerPage.value) : 15,
      };

      onFilterChange(activeFilters);
    }, 400);

  return () => clearTimeout(handler);
  }, [
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    selectedSeller,
    selectedStatus,
    selectedPublished,
    selectedFeatured,
    selectedPerPage,
    onFilterChange,
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedBrand(null);
    setSelectedSeller(null);
    setSelectedStatus(null);
    setSelectedPublished(null);
    setSelectedFeatured(null);
    setSelectedPerPage(perPageOptions[1]);

    onFilterChange({
      search: undefined,
      category_id: undefined,
      sub_category_id: undefined,
      brand_id: undefined,
      seller_id: undefined,
      status: undefined,
      published: undefined,
      is_featured: undefined,
      per_page: 15,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input & Reset Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            onSearch={(term) => setSearchTerm(term)}
            placeholder="Search products..."
          />
        </div>

        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="flex items-center gap-2 text-xs h-9 text-gray-600 hover:text-gray-900 self-end sm:self-auto"
        >
          <RotateCcw className="size-3.5" />
          Reset Filters
        </Button>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="w-full">
          <CustomSelect
            options={categories}
            value={selectedCategory}
            onChange={(opt) => {
              setSelectedCategory(opt);
              setSelectedSubCategory(null);
            }}
            placeholder="Category"
          />
        </div>

        {/* Sub Category with Loader */}
        <div className={`w-full relative ${!selectedCategory || isSubcategoryLoading ? "opacity-60 pointer-events-none" : ""}`}>
          <CustomSelect
            options={subcategories}
            value={selectedSubCategory}
            onChange={(opt) => setSelectedSubCategory(opt)}
            placeholder={
              !selectedCategory
                ? "Select Category First"
                : isSubcategoryLoading
                ? "Loading..."
                : "Subcategory"
            }
          />
          {isSubcategoryLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="w-full">
          <CustomSelect
            options={brands}
            value={selectedBrand}
            onChange={(opt) => setSelectedBrand(opt)}
            placeholder="Brand"
          />
        </div> 

        <div className="w-full">
          <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(opt) => setSelectedStatus(opt)}
            placeholder="Status"
          />
        </div>

        <div className="w-full">
          <CustomSelect
            options={publishedOptions}
            value={selectedPublished}
            onChange={(opt) => setSelectedPublished(opt)}
            placeholder="Published"
          />
        </div>

        <div className="w-full">
          <CustomSelect
            options={featuredOptions}
            value={selectedFeatured}
            onChange={(opt) => setSelectedFeatured(opt)}
            placeholder="Featured"
          />
        </div>

        <div className="w-full">
          <CustomSelect
            options={perPageOptions}
            value={selectedPerPage}
            onChange={(opt) => setSelectedPerPage(opt)}
            placeholder="Per Page"
          />
        </div>
      </div>
    </div>
  );
}