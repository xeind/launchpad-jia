"use client";

import { useRouter } from "next/navigation";
import AvatarImage from "../components/AvatarImage/AvatarImage";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import useDateTimer from "../hooks/useDateTimerHook";
import { clearUserSession } from "../Utils";

const ChevronLeftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5L8 10L12 15"
      stroke="#A4A7AE"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 5L12 10L8 15"
      stroke="#A4A7AE"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function HeaderBar(props: {
  activeLink: string;
  currentPage: string;
  icon?: string;
}) {
  const router = useRouter();
  const { user } = useAppContext();
  const [role, setRole] = useState<string>("");
  const { activeLink, currentPage, icon } = props;
  const [showAuthUserOptions, setShowAuthUserOptions] = useState(false);
  const date = useDateTimer();

  useEffect(() => {
    if (user) {
      const activeOrg = localStorage.activeOrg;
      if (activeOrg) {
        const parsedActiveOrg = JSON.parse(activeOrg);
        setRole(parsedActiveOrg.role);
      }
    }
  }, [user]);

  return (
    <div className="header">
      <div className="container-fluid">
        <div className="header-body">
          <div className="row align-items-center justify-content-between py-4">
            <div className="col-lg-6 col-7">
              <nav aria-label="breadcrumb" className="d-none d-md-inline-block">
                <ol
                  className="breadcrumb breadcrumb-links"
                  style={{
                    backgroundColor: "transparent",
                    padding: 0,
                    marginBottom: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    className="mr-2.5 flex cursor-pointer items-center"
                    onClick={() => router.back()}
                  >
                    <ChevronLeftIcon />
                  </div>
                  <div
                    className="mr-2.5 flex cursor-pointer items-center"
                    onClick={() => router.forward()}
                  >
                    <ChevronRightIcon />
                  </div>
                  <div className="mr-2.5 flex items-center text-gray-400">
                    |
                  </div>
                  <div className="mr-2.5 flex items-center">
                    <i
                      className={`${icon || "la la-home"} text-gray`}
                      style={{ fontSize: 16 }}
                    ></i>
                  </div>
                  <div className="mr-2.5 flex items-center">
                    <h4
                      className="text-gray mb-0"
                      style={{ fontSize: "16px", fontWeight: 400 }}
                    >
                      {activeLink}
                    </h4>
                  </div>
                  <div
                    className="mr-3 flex cursor-pointer items-center"
                    onClick={() => router.forward()}
                  >
                    <ChevronRightIcon />
                  </div>
                  <li className="breadcrumb-item flex items-center p-0">
                    <h4
                      className="d-inline-block mb-0 text-black"
                      style={{
                        fontSize: "16px",
                        fontWeight: 400,
                        backgroundColor: "#F3F4F6",
                        padding: "6px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      {currentPage}
                    </h4>
                  </li>
                </ol>
              </nav>
            </div>

            <div className="col-lg-6 col-7">
              <div className="flex w-full flex-row items-center justify-end gap-2.5">
                <span
                  className="text-sm font-medium"
                  style={{ color: "#414651" }}
                >
                  {date?.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "#717680" }}
                >
                  {date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {user && (
                  <div
                    className="flex cursor-pointer items-center gap-2.5"
                    onClick={() => setShowAuthUserOptions(!showAuthUserOptions)}
                  >
                    <AvatarImage src={user?.image} alt="Avatar" />
                    <div className="flex flex-col items-start">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#414651" }}
                      >
                        {user?.name}
                      </span>
                      <span
                        className="text-sm font-medium capitalize"
                        style={{ color: "#717680" }}
                      >
                        {role?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`dropdown-menu dropdown-menu-right org-dropdown-anim mt-1 overflow-hidden${
                  showAuthUserOptions ? "show" : ""
                }`}
                style={{
                  maxWidth: "300px",
                  borderRadius: 10,
                  boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
                }}
              >
                <div
                  className="flex flex-row items-center gap-2.5 border-b p-2.5"
                  style={{ borderBottomColor: "#E9EAEB" }}
                >
                  <AvatarImage src={user?.image} alt="Avatar" />
                  <div className="flex flex-col items-start">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#414651" }}
                    >
                      {user?.name}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#717680" }}
                    >
                      {user?.email}
                    </span>
                  </div>
                </div>
                {/* Log out button */}
                <button
                  className="dropdown-item d-flex align-items-center font-semibold"
                  style={{ fontSize: 15 }}
                  onClick={() => {
                    clearUserSession();
                    // const host = window.location.host;
                    // if (host.includes("hirejia")) {
                    //   // Redirect to home page for hirejia domain
                    //   window.location.href = "/";
                    // } else {
                    //   window.location.href = "/login";
                    // }

                    window.location.href = "/login";
                  }}
                >
                  <i className="la la-sign-out"></i> Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
