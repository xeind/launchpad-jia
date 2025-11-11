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
import TeamAccessCard from "./TeamAccessCard";

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

          <TeamAccessCard />
        </div>

        <div
          style={{
            width: "20%",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: "1rem",
            alignSelf: "flex-start",
          }}
        >
          <CareerFormCard
            heading="Tips"
            iconBgColor="transparent"
            customIcon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1_12033)">
                  <path
                    d="M5.20833 17.5H8.54167C8.54167 18.4167 7.79167 19.1667 6.875 19.1667C5.95833 19.1667 5.20833 18.4167 5.20833 17.5ZM3.54167 16.6667H10.2083V15H3.54167V16.6667ZM13.125 8.74999C13.125 11.9333 10.9083 13.6333 9.98333 14.1667H3.76667C2.84167 13.6333 0.625 11.9333 0.625 8.74999C0.625 5.29999 3.425 2.49999 6.875 2.49999C10.325 2.49999 13.125 5.29999 13.125 8.74999ZM11.4583 8.74999C11.4583 6.22499 9.4 4.16666 6.875 4.16666C4.35 4.16666 2.29167 6.22499 2.29167 8.74999C2.29167 10.8083 3.53333 11.9917 4.25 12.5H9.5C10.2167 11.9917 11.4583 10.8083 11.4583 8.74999ZM17.1833 6.97499L16.0417 7.49999L17.1833 8.02499L17.7083 9.16666L18.2333 8.02499L19.375 7.49999L18.2333 6.97499L17.7083 5.83333L17.1833 6.97499ZM15.2083 5.83333L15.9917 4.11666L17.7083 3.33333L15.9917 2.54999L15.2083 0.833328L14.425 2.54999L12.7083 3.33333L14.425 4.11666L15.2083 5.83333Z"
                    fill="url(#paint0_linear_1_12033)"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_1_12033"
                    x1="0.624708"
                    y1="19.1665"
                    x2="18.9535"
                    y2="0.421169"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FCCEC0" />
                    <stop offset="0.33" stopColor="#EBACC9" />
                    <stop offset="0.66" stopColor="#CEB6DA" />
                    <stop offset="1" stopColor="#9FCAED" />
                  </linearGradient>
                  <clipPath id="clip0_1_12033">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
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
