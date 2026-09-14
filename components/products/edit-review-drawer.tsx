"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductReview, UpdateReviewPayload } from "@/types/product-review";

interface EditReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  review: ProductReview | null;
  onSave: (id: number, payload: UpdateReviewPayload) => Promise<void>;
  isLoading?: boolean;
}

export default function EditReviewDrawer({
  isOpen,
  onClose,
  review,
  onSave,
  isLoading = false,
}: EditReviewDrawerProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment || "");
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(review.id, { rating, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-light-primary-text">
              View Product Review (#{review.id})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>

          <form id="edit-review-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {review.product?.name || `Product #${review.product_id}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <StarIcon
                      className={cn(
                        "w-6 h-6 transition-colors",
                        star <= rating ? "text-warning fill-warning" : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                rows={5}
                value={comment}
                disabled
                placeholder="Write review comment..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button> 
        </div>
      </div>
    </div>
  );
}