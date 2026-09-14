"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";

import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/icons";

interface SearchItem {
  id: number;
  text: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialProducts: SearchItem[] = [
  { id: 1, text: "Wireless Bluetooth Headphones" },
  { id: 2, text: "USB-C Charging Cable" },
  { id: 3, text: "Laptop Cooling Pad" },
];

const initialNewItems: SearchItem[] = [
  { id: 4, text: "Mechanical Keyboard RGB" },
  { id: 5, text: "Portable Power Bank" },
  { id: 6, text: "Smart Watch Pro" },
  { id: 7, text: "Wireless Mouse Ergonomic" },
  { id: 8, text: "Webcam HD 1080p" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchItem[]>(initialProducts);
  const [newItems, setNewItems] = useState<SearchItem[]>(initialNewItems);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setProducts(initialProducts);
      setNewItems(initialNewItems);
    }
  }

  const removeProduct = useCallback((id: number) => {
    setProducts((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) {
        setNewItems((n) => [...n, removed]);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const addItem = useCallback((item: SearchItem) => {
    setProducts((prev) => [...prev, item]);
    setNewItems((prev) => prev.filter((n) => n.id !== item.id));
  }, []);

  // Filter items based on search query
  const lowerQuery = query.toLowerCase().trim();

  const filteredProducts = lowerQuery
    ? products.filter((p) => p.text.toLowerCase().includes(lowerQuery))
    : products;

  const filteredNewItems = lowerQuery
    ? newItems.filter((n) => n.text.toLowerCase().includes(lowerQuery))
    : newItems;

  const noResults =
    lowerQuery &&
    filteredProducts.length === 0 &&
    filteredNewItems.length === 0;

  const handleSave = () => {
    // Save logic — products list is the current selection
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl transition-all duration-300 data-closed:scale-95 data-closed:opacity-0"
        >
          {/* Search Input */}
          <div className="p-4 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-light-primary-text" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                autoFocus
                className="w-full h-9 pl-9 pr-4 border border-gray-500/20 rounded-full text-sm focus:outline-none bg-white focus:border-primary"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {/* No Results */}
            {noResults && (
              <div className="text-center py-8 text-sm text-gray-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Added Product */}
            {filteredProducts.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Added Product
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    ({products.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  {filteredProducts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center h-9.5 justify-between bg-gray-50 rounded-full p-2 group hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <SearchIcon className="size-4 text-light-primary-text" />
                        <span className="text-sm text-gray-700">
                          {item.text}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => removeProduct(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Added New */}
            {filteredNewItems.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Added New
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    ({newItems.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  {filteredNewItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center h-9.5 justify-between bg-transparent  rounded-full p-2 group hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <SearchIcon className="size-4 text-light-primary-text" />
                        <span className="text-sm text-gray-700">
                          {item.text}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => addItem(item)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-500/20 flex justify-end gap-3">
            <Button variant="outline" size="xs" onClick={onClose}>
              Cancel
            </Button>
            <Button size="xs" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
