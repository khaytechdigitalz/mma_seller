import PromoPopupTable from "@/components/promo-popup/promo-popup-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promo Popups",
  description: "Manage promotional popups shown to customers.",
};

export default function PromoPopupPage() {
  return (
    <div className="space-y-4 sm:space-y-6 bg-white rounded-2xl">
      <PromoPopupTable />
    </div>
  );
}
