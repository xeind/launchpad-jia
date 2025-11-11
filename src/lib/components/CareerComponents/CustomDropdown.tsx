"use client";
import { useEffect, useRef, useState, useMemo } from "react";

export default function CustomDropdown(props) {
  const {
    onSelectSetting,
    screeningSetting,
    settingList,
    placeholder,
    boldSelected = false,
  } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate the longest option text to set a fixed width
  const longestOptionLength = useMemo(() => {
    const allOptions = [
      ...settingList.map((s) => s.name?.replace("_", " ") || ""),
      placeholder,
    ];
    const longest = allOptions.reduce(
      (a, b) => (a.length > b.length ? a : b),
      "",
    );
    // Approximate width: 9px per character + icon space + padding + chevron + checkmark space
    return Math.max(longest.length * 9 + 100, 220);
  }, [settingList, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div
      className="dropdown relative inline-block"
      ref={dropdownRef}
      style={{ width: `${longestOptionLength}px` }}
    >
      <button
        disabled={settingList.length === 0}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base font-medium capitalize text-[#181D27] transition-colors duration-200 ${screeningSetting ? "hover:bg-gray-100" : ""} `}
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
      >
        <span className={screeningSetting ? "text-gray-800" : "text-gray-400"}>
          <i
            className={
              settingList.find((setting) => setting.name === screeningSetting)
                ?.icon
            }
          ></i>{" "}
          {screeningSetting?.replace("_", " ") || placeholder}
        </span>
        <i className="la la-angle-down ml-auto"></i>
      </button>
      <div
        className={`dropdown-menu mt-1 ${dropdownOpen ? "show" : "hidden"} absolute left-0 right-0 top-full z-[1000] max-h-[200px] overflow-y-auto rounded-lg border border-gray-300 bg-white p-2.5 shadow-md`}
        style={{ display: dropdownOpen ? "block" : "none" }}
      >
        {settingList.map((setting, index) => (
          <div key={index}>
            <button
              className={`dropdown-item w-full overflow-hidden !rounded-md px-3 py-2.5 text-black ${boldSelected && screeningSetting === setting.name ? "font-bold" : "font-medium"} !flex cursor-pointer !flex-row !items-center !justify-between border-none bg-transparent capitalize transition-colors duration-150 hover:bg-gray-100`}
              onClick={() => {
                onSelectSetting(setting.name);
                setDropdownOpen(false);
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {setting.icon && <i className={setting.icon}></i>}
                <span className="truncate">
                  {setting.name?.replace("_", " ")}
                </span>
              </div>
              {setting.name === screeningSetting && (
                <i className="la la-check ml-2 flex-shrink-0 text-lg font-bold text-blue-500"></i>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
