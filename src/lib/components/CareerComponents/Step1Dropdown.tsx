"use client";
import { useEffect, useRef, useState } from "react";

export default function Step1Dropdown(props) {
  const {
    onSelectSetting,
    screeningSetting,
    settingList,
    placeholder,
    disabled = false,
  } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="dropdown relative inline-block w-full" ref={dropdownRef}>
      <button
        disabled={settingList.length === 0 || disabled}
        className={`
          w-full
          rounded-lg
          px-4 py-2.5
          text-base
          font-medium
          capitalize
          flex items-center gap-2
          transition-colors duration-200
          ${disabled ? "!bg-gray-50 !border-0 !text-gray-500 !cursor-not-allowed pointer-events-none" : "bg-white border border-gray-300 text-[#181D27] cursor-pointer"}
          ${!disabled && screeningSetting ? "hover:bg-gray-100" : ""}
        `}
        type="button"
        onClick={() => !disabled && setDropdownOpen((v) => !v)}
      >
        <span className={disabled ? "!text-gray-500" : (screeningSetting ? "text-gray-800" : "text-gray-400")}>
          <i
            className={
              settingList.find((setting) => setting.name === screeningSetting)
                ?.icon
            }
          ></i>{" "}
          {screeningSetting?.replace("_", " ") || placeholder}
        </span>
        <i className={`la la-angle-down ml-auto ${disabled ? "!text-gray-500" : ""}`}></i>
      </button>
      <div
        className={`
          dropdown-menu
          mt-1
          ${dropdownOpen ? "show" : ""}
          p-2.5
          max-h-[200px]
          overflow-y-auto
          absolute
          top-full
          left-0
          right-0
          z-[1000]
          bg-white
          border border-gray-300
          rounded-lg
          shadow-md
        `}
      >
        {settingList.map((setting, index) => (
          <div
            className={
              index < settingList.length - 1 ? "border-b border-gray-300" : ""
            }
            key={index}
          >
            <button
              className={`
                dropdown-item
                w-full
                !rounded-md
                overflow-hidden
                py-2.5 px-3
                text-black
                font-medium
                bg-transparent
                !flex !flex-row !justify-between !items-center
                capitalize
                border-none
                cursor-pointer
                transition-colors duration-150
                hover:bg-gray-300
              `}
              onClick={() => {
                onSelectSetting(setting.name);
                setDropdownOpen(false);
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {setting.icon && <i className={setting.icon}></i>}
                <span className="truncate">
                  {setting.name?.replace("_", " ")}
                </span>
              </div>
              {setting.name === screeningSetting && (
                <i className="la la-check text-lg text-blue-500 font-bold flex-shrink-0 ml-2"></i>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
