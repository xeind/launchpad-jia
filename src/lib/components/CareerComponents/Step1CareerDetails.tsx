"use client";

import { useEffect, useState } from "react";
import { useCareerFormStore } from "@/lib/hooks/useCareerFormStore";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import Step1Dropdown from "@/lib/components/CareerComponents/Step1Dropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import CareerFormCard from "./CareerFormCard";
import FormLabel from "./FormLabel";
import FormSectionHeader from "./FormSectionHeader";
import FormField from "./FormField";
import FormRow from "./FormRow";
import SalaryInput from "./SalaryInput";

const employmentTypeOptions = [{ name: "Full-Time" }, { name: "Part-Time" }];

const workSetupOptions = [
  { name: "Fully Remote" },
  { name: "Onsite" },
  { name: "Hybrid" },
];

const currencyOptions = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function Step1CareerDetails() {
  const {
    jobTitle,
    description,
    employmentType,
    workSetup,
    country,
    province,
    city,
    minimumSalary,
    maximumSalary,
    currency,
    salaryNegotiable,
    updateField,
    nextStep,
    validateStep,
    saveDraft,
    errors,
  } = useCareerFormStore();

  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [showMinCurrencyDropdown, setShowMinCurrencyDropdown] = useState(false);
  const [showMaxCurrencyDropdown, setShowMaxCurrencyDropdown] = useState(false);

  // Format number with commas
  const formatNumberWithCommas = (value: string | number) => {
    if (!value) return "";
    const num = value.toString().replace(/,/g, "");
    if (isNaN(Number(num))) return "";
    return Number(num).toLocaleString();
  };

  // Remove commas for storage
  const parseNumberFromFormatted = (value: string) => {
    return value.replace(/,/g, "");
  };

  useEffect(() => {
    const parseProvinces = () => {
      setProvinceList(philippineCitiesAndProvinces.provinces);

      // Set default province if not already set
      if (!province) {
        const defaultProvince = philippineCitiesAndProvinces.provinces[0];
        updateField("province", defaultProvince.name);

        const cities = philippineCitiesAndProvinces.cities.filter(
          (city) => city.province === defaultProvince.key,
        );
        setCityList(cities);

        if (!city) {
          updateField("city", cities[0].name);
        }
      } else {
        // Load cities for existing province
        const provinceObj = philippineCitiesAndProvinces.provinces.find(
          (p) => p.name === province,
        );
        if (provinceObj) {
          const cities = philippineCitiesAndProvinces.cities.filter(
            (city) => city.province === provinceObj.key,
          );
          setCityList(cities);
        }
      }
    };
    parseProvinces();
  }, [province, city, updateField]);

  // Close currency dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-currency-dropdown]")) {
        setShowMinCurrencyDropdown(false);
        setShowMaxCurrencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <CareerFormCard heading="1. Career Information" icon="">
            <FormSectionHeader marginTop={8}>
              Basic Information
            </FormSectionHeader>
            <FormField>
              <FormLabel required>Job Title</FormLabel>
              <input
                value={jobTitle}
                className="form-control"
                placeholder="Enter job title"
                onChange={(e) => {
                  updateField("jobTitle", e.target.value || "");
                }}
              />
              {errors.jobTitle && (
                <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                  {errors.jobTitle}
                </div>
              )}
            </FormField>

            <FormSectionHeader>Work Setting</FormSectionHeader>

            {/* Employment Type + Arrangement Row */}
            <FormRow>
              <FormField>
                <FormLabel required>Employment Type</FormLabel>
                <Step1Dropdown
                  onSelectSetting={(employmentType: string) => {
                    updateField("employmentType", employmentType);
                  }}
                  screeningSetting={employmentType}
                  settingList={employmentTypeOptions}
                  placeholder="Choose Employment Type"
                />
                {errors.employmentType && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {errors.employmentType}
                  </div>
                )}
              </FormField>
              <FormField>
                <FormLabel required>Arrangement</FormLabel>
                <Step1Dropdown
                  onSelectSetting={(setting: string) => {
                    updateField("workSetup", setting);
                  }}
                  screeningSetting={workSetup}
                  settingList={workSetupOptions}
                  placeholder="Choose Work Arrangement"
                />
                {errors.workSetup && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {errors.workSetup}
                  </div>
                )}
              </FormField>
            </FormRow>

            <FormSectionHeader>Location</FormSectionHeader>

            {/* Location Row - Country + Province + City */}
            <FormRow>
              <FormField>
                <FormLabel required>Country</FormLabel>
                <Step1Dropdown
                  onSelectSetting={(setting: string) => {
                    updateField("country", setting);
                  }}
                  screeningSetting={country}
                  settingList={[{ name: "Philippines" }]}
                  placeholder="Philippines"
                />
              </FormField>
              <FormField>
                <FormLabel required>State / Province</FormLabel>
                <Step1Dropdown
                  onSelectSetting={(province: string) => {
                    updateField("province", province);
                    const provinceObj = provinceList.find(
                      (p: any) => p.name === province,
                    );
                    const cities = philippineCitiesAndProvinces.cities.filter(
                      (city: any) => city.province === provinceObj.key,
                    );
                    setCityList(cities);
                    updateField("city", cities[0].name);
                  }}
                  screeningSetting={province}
                  settingList={provinceList}
                  placeholder="Choose state/province"
                />
                {errors.province && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {errors.province}
                  </div>
                )}
              </FormField>
              <FormField>
                <FormLabel required>City</FormLabel>
                <Step1Dropdown
                  onSelectSetting={(city: string) => {
                    updateField("city", city);
                  }}
                  screeningSetting={city}
                  settingList={cityList}
                  placeholder="Choose City"
                />
                {errors.city && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {errors.city}
                  </div>
                )}
              </FormField>
            </FormRow>

            {/* Salary Header with Negotiable Toggle */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <FormSectionHeader marginTop={0}>Salary</FormSectionHeader>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <label
                  className="switch"
                  style={{ margin: 0, display: "flex", alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={salaryNegotiable}
                    onChange={() =>
                      updateField("salaryNegotiable", !salaryNegotiable)
                    }
                  />
                  <span className="slider round"></span>
                </label>
                <span style={{ fontSize: 14, color: "#414651" }}>
                  Negotiable
                </span>
              </div>
            </div>

            {/* Salary Inputs Row */}
            <FormRow>
              <FormField>
                <FormLabel required>Minimum Salary</FormLabel>
                <SalaryInput
                  value={minimumSalary}
                  onChange={(value: string) =>
                    updateField("minimumSalary", value)
                  }
                  showDropdown={showMinCurrencyDropdown}
                  setShowDropdown={setShowMinCurrencyDropdown}
                  currency={currency}
                  setCurrency={(value: string) =>
                    updateField("currency", value)
                  }
                  currencyOptions={currencyOptions}
                  formatNumberWithCommas={formatNumberWithCommas}
                  parseNumberFromFormatted={parseNumberFromFormatted}
                />
              </FormField>

              <FormField>
                <FormLabel required>Maximum Salary</FormLabel>
                <SalaryInput
                  value={maximumSalary}
                  onChange={(value: string) =>
                    updateField("maximumSalary", value)
                  }
                  showDropdown={showMaxCurrencyDropdown}
                  setShowDropdown={setShowMaxCurrencyDropdown}
                  currency={currency}
                  setCurrency={(value: string) =>
                    updateField("currency", value)
                  }
                  currencyOptions={currencyOptions}
                  formatNumberWithCommas={formatNumberWithCommas}
                  parseNumberFromFormatted={parseNumberFromFormatted}
                />
              </FormField>
            </FormRow>
            {errors.salary && (
              <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.salary}
              </div>
            )}
          </CareerFormCard>

          <CareerFormCard heading="2. Job Description" icon="">
            <FormLabel required>Job Description</FormLabel>
            <RichTextEditor
              setText={(value: string) => updateField("description", value)}
              text={description}
            />
            {errors.description && (
              <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {errors.description}
              </div>
            )}
          </CareerFormCard>
        </div>

        <div
          style={{
            width: "20%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "sticky",
            top: "1rem",
            alignSelf: "flex-start",
          }}
        >
          <CareerFormCard
            heading="Tips"
            iconBgColor="#181D27"
            customIcon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="bulbGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#9fcaed" />
                    <stop offset="50%" stopColor="#ceb6da" />
                    <stop offset="100%" stopColor="#ebacc9" />
                  </linearGradient>
                </defs>
                <path
                  d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6Z"
                  fill="url(#bulbGradient)"
                  stroke="url(#bulbGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  fontSize: 14,
                  color: "#414651",
                  lineHeight: 1.6,
                }}
              >
                <li style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>
                    Use clear, standard job titles
                  </span>{" "}
                  for better searchability (e.g., "Software Engineer" instead of
                  "Code Ninja" or "Tech Rockstar").
                </li>
                <li style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>Avoid abbreviations</span>{" "}
                  or internal role codes that applicants may not understand
                  (e.g., use "QA Engineer" instead of "QE II" or "QA-TL").
                </li>
                <li>
                  <span style={{ fontWeight: 500 }}>Keep it concise</span> – job
                  titles should be no more than a few words (2–4 max), avoiding
                  fluff or marketing terms.
                </li>
              </ul>
            </div>
          </CareerFormCard>
        </div>
      </div>
    </>
  );
}
