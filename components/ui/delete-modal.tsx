import React, { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { ImageAdd } from "@/icons";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are You Sure You Want to Delete",
  description,
}: DeleteModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/30" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-[330px] transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6  text-center align-middle shadow-xl transition-all">
                <div className="flex justify-center mb-6">
                  <ImageAdd className="h-10 w-10 text-light-primary-text" />
                </div>
                <h3 className="text-base font-semibold leading-6 text-light-primary-text mb-2">
                  {title}
                </h3>

                <p className="text-sm text-light-secondary-text mb-6 text-center leading-5.5">
                  {description ||
                    "This action cannot be undone. This will permanently delete the selected item."}
                </p>

                <div className="flex items-center justify-center gap-2.5">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="xs"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button size="xs" onClick={onConfirm} className="w-full">
                    Confirm
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
