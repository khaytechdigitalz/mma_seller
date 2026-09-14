"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { TopCountry } from "@/types/dashboard";


interface TopCountryCardProps {
  countries?: TopCountry[];
  isLoading?: boolean;
}

// Country code/flag lookup helper for fallback visualization
const COUNTRY_FLAGS: Record<string, string> = {
  Nigeria: "🇳🇬",
  Canada: "🇨🇦",
  "South Korea": "🇰🇷",
  Korean: "🇰🇷",
  France: "🇫🇷",
  Germany: "🇩🇪",
  German: "🇩🇪",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  "United Kingdom": "🇬🇧",
  UK: "🇬🇧",
};

export default function TopCountryCard({
  countries = [],
  isLoading = false,
}: TopCountryCardProps) {
  // Sparkline chart configuration generator
   

  // Calculate dynamic total sales across top countries for subtitle
  const totalSalesSum = countries.reduce(
    (acc, country) => acc + (parseFloat(country.total_sales) || 0),
    0
  );

const formattedTotalSales = `₦${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(totalSalesSum)}`;

const formatSalesVal = (sales: string | number) => {
    const num = typeof sales === "string" ? parseFloat(sales) : sales;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };
  if (isLoading) {
    return (
      <DashboardCard title="Top Countries By sales" subtitle="Loading metrics...">
        <div className="space-y-6 pt-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-6 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-7 w-[80px] bg-gray-200 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Top Countries By sales"
      subtitle={`Total Sale ${formattedTotalSales}`}
    >
      <div className="space-y-6 pt-6">
        {countries.length > 0 ? (
          countries.map((country, index) => {
            const countryName = country.shipping_country || "Unknown";
            const flagEmoji = COUNTRY_FLAGS[countryName] || "🌐";

            return (
              <div
                key={`${countryName}-${index}`}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 flex items-center justify-center text-lg shrink-0 select-none">
                    {flagEmoji}
                  </div>
                  <span className="font-semibold font-dm-sans text-light-primary-text text-sm">
                    {countryName}
                  </span>
                </div>

                <div className="flex-1 h-7 max-w-[80px]">
                  
                </div>

                <div className="text-right">
                  <span className="font-semibold text-sm text-light-primary-text">
                    {formatSalesVal(country.total_sales)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            No sales country data available.
          </p>
        )}
      </div>
    </DashboardCard>
  );
}