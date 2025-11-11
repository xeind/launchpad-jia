"use client";

import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { TeamMember } from "@/lib/hooks/useCareerFormStore";

interface MemberSelectorProps {
  onSelectMember: (member: TeamMember) => void;
  existingMembers: TeamMember[];
  placeholder?: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export default function MemberSelector({
  onSelectMember,
  existingMembers,
  placeholder = "Add member",
}: MemberSelectorProps) {
  const { orgID } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch members when dropdown opens
  useEffect(() => {
    if (isOpen && orgID) {
      fetchMembers();
    }
  }, [isOpen, orgID]);

  const fetchMembers = async () => {
    if (!orgID) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search-members?orgID=${orgID}&search=${encodeURIComponent(searchQuery)}&limit=20`,
      );
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        fetchMembers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectMember = (member: Member) => {
    const teamMember: TeamMember = {
      id: member._id,
      name: member.name,
      email: member.email,
      role: "Contributor", // Default role for new members
    };
    onSelectMember(teamMember);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Filter out already added members
  const availableMembers = members.filter(
    (member) =>
      !existingMembers.some((existing) => existing.email === member.email),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="button"
      >
        <i className="la la-plus text-gray-500"></i>
        <span>{placeholder}</span>
        <i
          className={`la la-angle-${isOpen ? "up" : "down"} ml-auto text-gray-500`}
        ></i>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-1 w-80 rounded-lg border border-gray-300 bg-white shadow-lg">
          {/* Search input */}
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <i className="la la-search absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"></i>
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          </div>

          {/* Members list */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <i className="la la-spinner la-spin mr-2"></i>
                Loading members...
              </div>
            ) : availableMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No members found" : "No available members"}
              </div>
            ) : (
              availableMembers.map((member) => (
                <button
                  key={member._id}
                  onClick={() => handleSelectMember(member)}
                  className="w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      src={member.image || ""}
                      alt={member.name}
                      className="avatar avatar-sm rounded-circle"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="truncate text-sm text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
