// src/app/storefront/page.tsx (or respective path)
import StorefrontEdit from "@/components/storefront/storefront-edit";
import StorefrontAddress from "@/components/storefront/storefront-address";

export default function Page() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <StorefrontEdit />
      <StorefrontAddress />
    </div>
  );
}