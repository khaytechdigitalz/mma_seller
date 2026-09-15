"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  ShoppingBag, 
  Code2, 
  Calendar, 
  Mail, 
  MapPin, 
  Receipt,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/axios";

export interface MasterOrder {
  id: number;
  order_no: string;
  user_id: number;
  delivery_agent_id?: number | null;
  order_status: string;
  payment_status: string;
  payment_method: string;
  transaction_ref: string;
  subtotal: string;
  tax_amount: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  shipping_country: string;
  shipping_state: string;
  shipping_city?: string | null;
  shipping_zip?: string | null;
  shipping_address: string;
  billing_address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  vendor_order_id: number;
  product_id: number;
  seller_id: number;
  unit_price: string;
  quantity: number;
  tax: string;
  discount: string;
  total_price: string;
  variation_options?: any;
  delivery_status: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    thumbnail: string;
  };
}

export interface Seller {
  id: number;
  name: string;
  email: string;
}

export interface TransactionDetail {
  id: number;
  order_id: number;
  user_id: number;
  seller_id: number;
  sub_order_no: string;
  subtotal: string;
  shipping_fee: string;
  total_amount: string;
  order_status: string;
  currency?: string;
  created_at: string;
  updated_at: string;
  master_order?: MasterOrder;
  items?: OrderItem[];
  seller?: Seller;
}

export default function TransactionDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionDetails = useCallback(async () => {
    if (!id) {
      setError("No transaction ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      if (response.data?.status) {
        setTransaction(response.data.data);
      } else {
        setError("Failed to fetch transaction details.");
      }
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      setError(err?.response?.data?.message || "An error occurred while loading details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransactionDetails();
  }, [fetchTransactionDetails]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "successful":
      case "paid":
      case "shipped":
      case "delivered":
        return <Badge variant="success">{status}</Badge>;
      case "pending":
      case "processing":
        return <Badge variant="warning">{status}</Badge>;
      case "failed":
      case "cancelled":
        return <Badge variant="error">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number | string, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-gray-500">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center max-w-lg mx-auto my-12 border border-gray-100 shadow-xs">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Unable to Load Details</h3>
        <p className="text-sm text-gray-500 mb-6">{error || "Transaction not found."}</p>
        <Button onClick={() => router.back()} size="sm">
          <ArrowLeft className="size-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const masterOrder = transaction.master_order;
  const customer = masterOrder?.user;

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="size-5 text-gray-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {masterOrder?.transaction_ref || transaction.sub_order_no}
              </h1>
              {getStatusBadge(masterOrder?.payment_status || transaction.order_status)}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <Calendar className="size-3.5" /> Transacted on {formatDate(transaction.created_at)}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-gray-400 font-medium block">Sub-Order Total</span>
          <span className="text-2xl font-extrabold text-gray-900">
            {formatCurrency(transaction.total_amount, transaction.currency || "NGN")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Financial Breakdown & Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="size-5 text-primary" /> Financial Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(transaction.subtotal, transaction.currency || "NGN")}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Shipping Fee</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(transaction.shipping_fee, transaction.currency || "NGN")}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Payment Method</span>
                <span className="font-semibold text-primary uppercase">
                  {masterOrder?.payment_method || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Payment Status</span>
                <span className="font-semibold capitalize text-gray-800">
                  {masterOrder?.payment_status || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" /> Sub-Order Items ({transaction.sub_order_no})
              </h2>
              <Badge variant="info" className="capitalize">
                {transaction.order_status}
              </Badge>
            </div>

            <div className="divide-y divide-gray-100">
              {transaction.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    {item.product?.thumbnail && (
                      <div className="size-12 relative rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <Image
                          src={`/${item.product.thumbnail}`}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{item.product?.name || "Product Name"}</p>
                      <p className="text-xs text-gray-400">
                        SKU: {item.product?.sku || "N/A"} | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.total_price, transaction.currency || "NGN")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.unit_price, transaction.currency || "NGN")} / unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON Payload 
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Code2 className="size-5 text-primary" /> Raw Sub-Order Data
            </h2>
            <pre className="bg-gray-950 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-60 leading-relaxed">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
          */}
        </div>

        {/* Right Column (1/3): Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User className="size-5 text-primary" /> Customer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Full Name</span>
                <span className="font-medium text-gray-800">{customer?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-gray-400 shrink-0" />
                <span className="text-gray-700 truncate">{customer?.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          {masterOrder && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Shipping Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p>{masterOrder.shipping_address}</p>
                <p>
                  {masterOrder.shipping_city ? `${masterOrder.shipping_city}, ` : ""}
                  {masterOrder.shipping_state}
                </p>
                <p className="text-gray-500">{masterOrder.shipping_country}</p>
                {customer?.phone && (
                  <p className="text-xs text-gray-400 pt-2">
                    Phone: {customer.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}