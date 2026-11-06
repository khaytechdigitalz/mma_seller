"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Country, State, City } from "country-state-city";

export default function StorefrontAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Address Form States
  const [alias, setAlias] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isResidential, setIsResidential] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("NG");
  const [zip, setZip] = useState("");

  // Location Dropdown Lists
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Initialize Countries on Mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  // Update States whenever Country changes
  useEffect(() => {
    if (country) {
      const countryStates = State.getStatesOfCountry(country);
      setStates(countryStates);
    }
  }, [country]);

  // Update Cities whenever Country or State changes
  useEffect(() => {
    if (country && state) {
      // Find the state object to get its ISO code if required, or pass the state name/code
      const selectedStateObj = states.find((s) => s.name === state || s.isoCode === state);
      const stateCode = selectedStateObj ? selectedStateObj.isoCode : state;

      const stateCities = City.getCitiesOfState(country, stateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [country, state, states]);

  // Fetch Existing Address Details on Mount
  useEffect(() => {
    const fetchAddressDetails = async () => {
      try {
        setLoading(true);
        const endpoint = `address/${sellerId}/details`;
        const response = await apiClient.get(endpoint);
        const addressData = response.data?.data?.address || response.data?.data;

        if (addressData) {
          setAlias(addressData.alias || "");
          setFirstName(addressData.first_name || "");
          setLastName(addressData.last_name || "");
          setEmail(addressData.email || "");
          setPhone(addressData.phone || "");
          setIsResidential(addressData.is_residential || false);
          setLine1(addressData.line1 || "");
          setLine2(addressData.line2 || "");
          
          const fetchedCountry = addressData.country || "NG";
          const fetchedState = addressData.state || "";
          
          setCountry(fetchedCountry);
          
          if (fetchedCountry) {
            const countryStates = State.getStatesOfCountry(fetchedCountry);
            setStates(countryStates);
          }

          setState(fetchedState);

          if (fetchedCountry && fetchedState) {
            const selectedStateObj = states.find((s) => s.name === fetchedState || s.isoCode === fetchedState);
            const stateCode = selectedStateObj ? selectedStateObj.isoCode : fetchedState;
            const stateCities = City.getCitiesOfState(fetchedCountry, stateCode);
            setCities(stateCities);
          }

          setCity(addressData.city || "");
          setZip(addressData.zip || "");
        }
      } catch (error: any) {
        console.error("Failed to load storefront address:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressDetails();
  }, [sellerId]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const payload = {
        alias,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        is_residential: isResidential,
        line1,
        line2,
        city,
        state,
        country,
        zip,
      };

      const endpoint = `address/${sellerId}/update`;
      const response = await apiClient.post(endpoint, payload);

      toast.success(response.data?.message || "Storefront address saved successfully!");
      router.push("/storefront/details?id=0");
    } catch (error: any) {
      console.error("Failed to save storefront address:", error);
      toast.error(error?.response?.data?.message || "Failed to save storefront address.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl gap-3">
        <Loader2 className="size-8 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading storefront address...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <PageHeader title="Storefront Pickup & Shipping Address" backHref="/storefront" className="gap-4" />
      </div>

      {/* Address Form Container */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
        <h2 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
          Address Information
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Address Alias (e.g. Main Warehouse)" value={alias} onChange={(e) => setAlias(e.target.value)} />
            <div className="flex items-center gap-3 px-3 border border-gray-200 rounded-xl">
              <input
                type="checkbox"
                id="is_residential"
                checked={isResidential}
                onChange={(e) => setIsResidential(e.target.checked)}
                className="size-4 accent-teal-600 cursor-pointer"
              />
              <label htmlFor="is_residential" className="text-sm font-medium text-gray-700 cursor-pointer">
                Is Residential Address?
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <FloatingInput label="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <FloatingInput label="Phone Number" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Street Address Line 1" required value={line1} onChange={(e) => setLine1(e.target.value)} />
            <FloatingInput label="Street Address Line 2 (Optional)" value={line2} onChange={(e) => setLine2(e.target.value)} />
          </div>

          {/* Location Dropdowns with City Fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Country Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setState("");
                  setCity("");
                }}
                required
                className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State / Province</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity("");
                }}
                required
                className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Select with Text Input Fallback */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
              {cities.length > 0 ? (
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="">Select City</option>
                  {cities.map((ct, idx) => (
                    <option key={idx} value={ct.name}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              ) : (
                <FloatingInput
                  label="City Name"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="ZIP / Postal Code" value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 sm:pt-6">
        <Button variant="outline" type="button" href="/storefront">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Address...
            </>
          ) : (
            "Save Address"
          )}
        </Button>
      </div>
    </form>
  );
}