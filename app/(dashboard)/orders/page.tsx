import OrderOverview from "@/components/orders/order-overview";
import OrderTable from "@/components/orders/order-table";
import ProfitMarginChart from "@/components/orders/profit-margin-chart";

export default function Page() {
  return (
    <div className="bg-white rounded-2xl py-4 sm:py-6">
      <div className="px-4 sm:px-6">
        <OrderOverview />
        <ProfitMarginChart />
      </div>
      <OrderTable />
    </div>
  );
}