"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { apiClient } from "@/lib/axios";
import { Loader2, Building2, Plus, Trash2, Power, X, AlertTriangle, CheckCircle2, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";

interface BankAccount {
  id: number;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_active: boolean;
}

interface BankOption {
  name: string;
  code: string;
}

export default function BankAccountSettings() {
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableBanks, setAvailableBanks] = useState<BankOption[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  
  // Searchable Dropdown States
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [validatingAccount, setValidatingAccount] = useState(false);

  // Confirmation Modal State for Delete
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Confirmation Modal State for Status Toggle
  const [toggleTarget, setToggleTarget] = useState<BankAccount | null>(null);
  const [toggling, setToggling] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBankAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/withdrawals/bank-accounts/list");
      if (res.data?.status) {
        setBankAccounts(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bank accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  // Fetch banks from GET /bank/list when opening the create modal
  const fetchAvailableBanks = async () => {
    if (availableBanks.length > 0) return;
    setFetchingBanks(true);
    try {
      const res = await apiClient.get("/withdrawals/bank/list");
      if (res.data?.status) {
        setAvailableBanks(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bank list.");
    } finally {
      setFetchingBanks(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateOpen(true);
    setBankCode("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setBankSearchQuery("");
    fetchAvailableBanks();
  };

  const handleSelectBank = (bank: BankOption) => {
    setBankCode(bank.code);
    setBankName(bank.name);
    setIsBankDropdownOpen(false);
    setBankSearchQuery("");

    // Re-trigger validation if account number is already 10 digits
    if (accountNumber.length === 10) {
      verifyAccountNumber(accountNumber, bank.code);
    }
  };

  const verifyAccountNumber = async (accNum: string, bCode: string) => {
    setValidatingAccount(true);
    try {
      const res = await apiClient.post("/withdrawals/bank-account/validate", {
        account_number: accNum,
        bank_code: bCode,
      });

      if (res.data?.status) {
        const resolvedName = res.data.data?.account_name;
        if (resolvedName) {
          setAccountName(resolvedName);
          toast.success("Account verified successfully.");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Could not resolve account details.");
      setAccountName("");
    } finally {
      setValidatingAccount(false);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(val);

    // Automatically call validation endpoint if length reaches 10 digits and bank is selected
    if (val.length === 10 && bankCode) {
      verifyAccountNumber(val, bankCode);
    } else if (val.length < 10) {
      setAccountName(""); // Clear resolved name if digits change
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode || !bankName) {
      toast.error("Please select a valid bank from the list.");
      return;
    }
    
    setSubmitting(true);

    try {
      const res = await apiClient.post("/withdrawals/bank-accounts/create", {
        bank_code: bankCode,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      });

      if (res.data?.status) {
        toast.success("Bank account added successfully!");
        setIsCreateOpen(false);
        setBankCode("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
        fetchBankAccounts();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add bank account.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!toggleTarget) return;
    setToggling(true);

    try {
      const res = await apiClient.patch(`/withdrawals/bank-accounts/${toggleTarget.id}/status`);
      if (res.data?.status) {
        toast.success(`Bank account successfully ${!toggleTarget.is_active ? 'activated' : 'deactivated'}.`);
        setBankAccounts((prev) =>
          prev.map((acc) => (acc.id === toggleTarget.id ? { ...acc, is_active: !acc.is_active } : acc))
        );
        setToggleTarget(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  const confirmDeleteBank = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await apiClient.delete("/withdrawals/bank-accounts/delete", {
        data: { bank_id: deleteTarget.id },
      });

      if (res.data?.status) {
        toast.success("Bank account deleted successfully.");
        setBankAccounts((prev) => prev.filter((acc) => acc.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete bank account.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredBanks = availableBanks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b pb-5 border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bank Account Details</h2>
            <p className="text-xs text-gray-500">Manage your payout accounts for wallet withdrawals</p>
          </div>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 text-xs font-semibold shadow-sm">
          <Plus className="size-4" /> Add Bank Account
        </Button>
      </div>

      {/* Bank Accounts List / Grid */}
      {bankAccounts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Building2 className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">No bank accounts linked</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Add a verified bank account to easily process your wallet withdrawals.
          </p>
          <Button onClick={handleOpenCreateModal} variant="outline" className="mt-4 text-xs">
            Add Bank Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bankAccounts.map((bank) => (
            <div
              key={bank.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden ${
                bank.is_active 
                  ? "border-emerald-200/60 bg-gradient-to-br from-white via-white to-emerald-50/20" 
                  : "border-gray-200 bg-gray-50/60 opacity-80"
              }`}
            >
              {bank.is_active && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />}

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg">
                      {bank.bank_name}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">({bank.bank_code})</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      bank.is_active 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {bank.is_active && <CheckCircle2 className="size-3 text-emerald-600" />}
                    {bank.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="font-mono text-xl font-bold tracking-tight text-gray-900">{bank.account_number}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{bank.account_name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                <button
                  onClick={() => setToggleTarget(bank)}
                  className={`text-xs font-medium flex items-center gap-1.5 transition px-2.5 py-1.5 rounded-lg ${
                    bank.is_active 
                      ? "text-amber-700 bg-amber-50 hover:bg-amber-100" 
                      : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  <Power className="size-3.5" />
                  {bank.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setDeleteTarget(bank)}
                  className="text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Create Bank Account Modal with Searchable Dropdown & Validation */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4 border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Bank Account</h3>
                <p className="text-xs text-gray-500">Select your bank and provide settlement details</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-4">
              {/* Searchable Bank Selector Dropdown */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-semibold text-gray-700">Select Bank</label>
                <div
                  onClick={() => !fetchingBanks && setIsBankDropdownOpen(!isBankDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 cursor-pointer focus:border-primary transition"
                >
                  <span className={bankName ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {fetchingBanks ? "Loading banks..." : bankName ? `${bankName}` : "Choose a bank..."}
                  </span>
                  <ChevronDown className="size-4 text-gray-400" />
                </div>

                {isBankDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search bank name..."
                        value={bankSearchQuery}
                        onChange={(e) => setBankSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-primary"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredBanks.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No banks found</p>
                      ) : (
                        filteredBanks.map((bank) => (
                          <div
                            key={bank.code}
                            onClick={() => handleSelectBank(bank)}
                            className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition ${
                              bankCode === bank.code ? "bg-primary/10 text-primary font-semibold" : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span>{bank.name}</span>
                            {/*<span className="font-mono text-[10px] text-gray-400">{bank.code}</span>*/}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <FloatingInput
                  label="Account Number (10 digits)"
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  required
                />
                {validatingAccount && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </div>
                )}
              </div>

              <FloatingInput
                label="Account Name"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                className={accountName ? "bg-emerald-50/50 font-semibold" : ""}
              />

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || validatingAccount || !accountName} className="rounded-xl">
                  {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
                  Save Bank Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Status Toggle Confirmation Modal */}
      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 relative shadow-2xl text-center">
            <div className={`size-12 rounded-full mx-auto flex items-center justify-center ${toggleTarget.is_active ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <Power className="size-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                {toggleTarget.is_active ? 'Deactivate Bank Account?' : 'Activate Bank Account?'}
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to {toggleTarget.is_active ? 'deactivate' : 'activate'} <span className="font-semibold text-gray-800">{toggleTarget.bank_name} ({toggleTarget.account_number})</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setToggleTarget(null)}
                className="w-full rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmToggleStatus}
                disabled={toggling}
                className={`w-full rounded-xl ${toggleTarget.is_active ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
              >
                {toggling && <Loader2 className="size-4 animate-spin mr-2" />}
                Yes, {toggleTarget.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 relative shadow-2xl text-center">
            <div className="size-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="size-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">Delete Bank Account?</h3>
              <p className="text-xs text-gray-500">
                This will permanently delete <span className="font-semibold text-gray-800">{deleteTarget.bank_name} - {deleteTarget.account_number}</span> from your account settings.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="w-full rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteBank}
                disabled={deleting}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleting && <Loader2 className="size-4 animate-spin mr-2" />}
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}