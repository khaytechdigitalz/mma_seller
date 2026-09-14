"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  CreditCard, 
  ShoppingBag, 
  Code2, 
  Calendar, 
  Mail, 
  MapPin, 
  Receipt 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/axios";

export interface TransactionDetail {
  id: number;
  order_id: number;
  user_id: number;
  transaction_ref: string;
  payment_gateway: string;
  amount: string;
  fee: number;
  total_amount: number;
  tax: number;
  currency: string;
  status: string;
  gateway_response?: {
    status?: boolean;
    message?: string;
    data?: {
      channel?: string;
      ip_address?: string;
      gateway_response?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
  order?: {
    id: number;
    order_no: string;
    order_status: string;
    payment_status: string;
    payment_method: string;
    subtotal: string;
    tax_amount: string;
    shipping_cost: string;
    discount_amount: string;
    total_amount: string;
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      phone?: string;
    };
    items?: Array<{
      id: number;
      product_name: string;
      sku: string;
      unit_price: string;
      quantity: number;
      total_price: string;
    }>;
  };
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
        return <Badge variant="success">Successful</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {transaction.transaction_ref}
              </h1>
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <Calendar className="size-3.5" /> Transacted on {formatDate(transaction.created_at)}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-gray-400 font-medium block">Total Paid</span>
          <span className="text-2xl font-extrabold text-gray-900">
            {formatCurrency(transaction.total_amount, transaction.currency)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Payment Breakdown & Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="size-5 text-primary" /> Payment Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Base Amount</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Gateway Fee</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(transaction.fee, transaction.currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Tax</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(transaction.tax, transaction.currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Gateway</span>
                <span className="font-semibold text-primary">
                  {transaction.payment_gateway}
                </span>
              </div>
            </div>

            {/* Gateway Response Details */}
            {transaction.gateway_response && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Gateway Verification Response
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-900 text-gray-200 p-4 rounded-xl font-mono">
                  <div>
                    <span className="text-gray-500 block">Channel</span>
                    <span>{transaction.gateway_response?.data?.channel || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">IP Address</span>
                    <span>{transaction.gateway_response?.data?.ip_address || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Message</span>
                    <span className="text-emerald-400">
                      {transaction.gateway_response?.message || "Verified"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Details & Items */}
          {transaction.order && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="size-5 text-primary" /> Order Items ({transaction.order.order_no})
                </h2>
                <Badge variant="info" className="capitalize">
                  {transaction.order.order_status}
                </Badge>
              </div>

              <div className="divide-y divide-gray-100">
                {transaction.order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400">SKU: {item.sku} | Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.total_price, transaction.currency)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.unit_price, transaction.currency)} / unit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Payload */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Code2 className="size-5 text-primary" /> Gateway Payload
            </h2>
            <pre className="bg-gray-950 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-60 leading-relaxed">
              {JSON.stringify(transaction.gateway_response, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right Column (1/3): User & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User className="size-5 text-primary" /> Customer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Full Name</span>
                <span className="font-medium text-gray-800">{transaction.user?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-gray-400 shrink-0" />
                <span className="text-gray-700 truncate">{transaction.user?.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          {transaction.order?.shipping_address && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Shipping Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">
                  {transaction.order.shipping_address.first_name}{" "}
                  {transaction.order.shipping_address.last_name}
                </p>
                <p>{transaction.order.shipping_address.address}</p>
                <p>
                  {transaction.order.shipping_address.city},{" "}
                  {transaction.order.shipping_address.state}
                </p>
                <p className="text-gray-500">{transaction.order.shipping_address.country}</p>
                {transaction.order.shipping_address.phone && (
                  <p className="text-xs text-gray-400 pt-2">
                    Phone: {transaction.order.shipping_address.phone}
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