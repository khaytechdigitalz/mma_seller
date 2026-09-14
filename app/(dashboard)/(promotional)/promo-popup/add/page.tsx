import AddPromoForm from "@/components/promo-popup/add-promo-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Promo Popup",
  description: "Create a new promotional popup.",
};

export default function AddPromoPopupPage() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-500/20">
      <AddPromoForm />
    </div>
  );
}
