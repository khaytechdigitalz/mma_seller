import EditPromoForm from "@/components/promo-popup/edit-promo-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Promo Popup",
  description: "Edit an existing promotional popup.",
};

export default function EditPromoPopupPage() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-500/20">
      <EditPromoForm />
    </div>
  );
}
