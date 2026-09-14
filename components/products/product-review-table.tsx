"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Eye, Trash, MessageAdd, StarIcon } from "@/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import EditReviewDrawer from "./edit-review-drawer";
import { apiClient } from "@/lib/axios";
import { ProductReview, UpdateReviewPayload } from "@/types/product-review";

const ratingOptions: Option[] = [
  { label: "All Ratings", value: "" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

const dateOptions: Option[] = [
  { label: "Date", value: "" },
  { label: "Newest", value: "desc" },
  { label: "Oldest", value: "asc" },
];

export default function ProductReviewTable() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<Option | null>(null);
  const [dateFilter, setDateFilter] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals & Drawers state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ProductReview | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. GET: Fetch product reviews using APIClient
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/product-reviews", {
        params: {
          page: currentPage,
          search: searchQuery || undefined,
          rating: ratingFilter?.value || undefined,
          sort_order: dateFilter?.value || undefined,
        },
      });

      if (response.data?.status) {
        setReviews(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch product reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, ratingFilter, dateFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Search submit/change from SearchInput
  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setCurrentPage(1);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((r) => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, id]);
    } else {
      setSelectedReviews((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllSelected =
    reviews.length > 0 && selectedReviews.length === reviews.length;

  // 3. PUT: Update product review using APIClient
  const handleUpdateReview = async (id: number, payload: UpdateReviewPayload) => {
    setIsUpdating(true);
    try {
      const response = await apiClient.put(`/product-reviews/${id}`, payload);

      if (response.data?.status) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to update product review:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. DELETE: Remove product review using APIClient
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await apiClient.delete(`/product-reviews/${reviewToDelete}`);

      if (response.data?.status) {
        setReviewToDelete(null);
        setIsDeleteModalOpen(false);
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to delete product review:", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating ? "text-warning fill-warning" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getImageSrc = (thumbnail?: string | null) => {
    if (!thumbnail) return null;
    return thumbnail.startsWith("http")
      ? thumbnail
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${thumbnail}`;
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl mb-4 sm:mb-6 font-bold text-light-primary-text leading-7.5">
            Product Review
          </h3>

          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
            {/* Search Input */}
            <SearchInput onSearch={handleSearch} placeholder="Search reviews..." />

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3">
              <div className="min-w-[140px]">
                <CustomSelect
                  value={ratingFilter}
                  onChange={setRatingFilter}
                  options={ratingOptions}
                  placeholder="Rating"
                />
              </div>
              <div className="min-w-[140px]">
                <CustomSelect
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={dateOptions}
                  placeholder="Date"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Order No</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-left pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Loading reviews...
              </TableCell>
            </TableRow>
          ) : reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No reviews found.
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((item) => {
              const imageSrc = getImageSrc(item.product?.thumbnail);

              return (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedReviews.includes(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(item.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                    {item.order_no}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg overflow-hidden relative bg-gray-100 flex items-center justify-center">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={item.product?.name || "Product"}
                            width={32}
                            height={32}
                            className="object-cover size-full"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-light-secondary-text truncate max-w-[180px]">
                        {item.product?.name || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-light-secondary-text whitespace-nowrap">
                    {item.user?.name || "Anonymous"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-light-secondary-text">
                    {item.comment || "No comment"}
                  </TableCell>
                  <TableCell>{renderStars(item.rating)}</TableCell>
                  <TableCell className="text-light-secondary-text whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      
                      <Button
                        variant="icon"
                        className="hover:text-primary"
                        onClick={() => {
                          setReviewToEdit(item);
                          setIsEditDrawerOpen(true);
                        }}
                      >
                        <MessageAdd className="size-4" />
                      </Button> 
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Edit Drawer */}
      <EditReviewDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setReviewToEdit(null);
        }}
        review={reviewToEdit}
        onSave={handleUpdateReview}
        isLoading={isUpdating}
      /> 
    </div>
  );
}