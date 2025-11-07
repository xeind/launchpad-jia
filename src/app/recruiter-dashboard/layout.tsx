"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import SidebarV2 from "../../lib/PageComponent/SidebarV2";

export default function Layout({ children }) {
  const [activeLink, setActiveLink] = useState("");
  const pathname = usePathname();
  const navItems = [
    // Hide Dashboard for now
    {
      label: "Dashboard",
      href: "/recruiter-dashboard",
      icon: "la la-chart-area",
    },
    {
      label: "Careers",
      href: "/recruiter-dashboard/careers",
      icon: "la la-suitcase",
    },
    {
      label: "Candidates",
      href: "/recruiter-dashboard/candidates",
      icon: "la la-id-badge",
    },
    { label: "To Do", href: "/recruiter-dashboard/to-do", icon: "la la-cogs" },
    // {
    //   label: "Inbox",
    //   href: "/recruiter-dashboard/inbox",
    //   icon: "la la-envelope",
    // },
  ];

  const footerNavItems = [
    {
      label: "Feedback",
      href: "/recruiter-dashboard/feedback",
      icon: "la la-comments",
    },
    {
      label: "Members",
      href: "/recruiter-dashboard/members",
      icon: "la la-users",
    },
    {
      label: "Settings",
      href: "/recruiter-dashboard/settings",
      icon: "la la-cog",
    },
  ];

  const superAdminNavItems = [
    {
      label: "Inbox",
      href: "/recruiter-dashboard/inbox",
      icon: "la la-envelope",
    },
    {
      label: "Email Automation [Beta]",
      href: "/recruiter-dashboard/email-automation",
      icon: "la la-cubes",
    },
  ];

  // Check active link from the url
  useEffect(() => {
    if (pathname) {
      let pathSplit = pathname.split("/");

      let activeMenu = null;
      const applicantLinkSet = [
        ...navItems,
        ...footerNavItems,
        ...superAdminNavItems,
      ];

      if (pathSplit.length <= 3) {
        activeMenu = applicantLinkSet.find((x) => x.href === pathname);
      }

      if (pathSplit.length > 3) {
        let path = "/" + pathSplit[1] + "/" + pathSplit[2];
        activeMenu = applicantLinkSet.find((x) => x.href === path);
      }

      if (!activeMenu) {
        // Default to careers
        activeMenu = applicantLinkSet.find(
          (x) => x.href === "/recruiter-dashboard/careers",
        );
      }

      setActiveLink(activeMenu.label);
    }
  }, [pathname]);

  return (
    <>
      <AuthGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Jia - WhiteCloak Technologies</title>
        <SidebarV2
          activeLink={activeLink}
          navItems={navItems}
          footerNavItems={footerNavItems}
          superAdminNavItems={superAdminNavItems}
        />
        <div
          style={{
            width: "100vw",
            height: "100vh",
            background: "#f8f9fc",
            padding: "24px",
            paddingLeft: "284px",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            className="main-content bg-white shadow-sm"
            id="panel"
            style={{
              height: "calc(100vh - 48px)",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid #E9EAEB",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
