"use client";

import { useState } from "react";
import { useCareerFormStore, TeamMember } from "@/lib/hooks/useCareerFormStore";
import CareerFormCard from "./CareerFormCard";
import MemberSelector from "./MemberSelector";
import RoleSelector from "./RoleSelector";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";

const roleOptions = [
  {
    value: "Contributor",
    label: "Contributor",
    description:
      "Helps evaluate candidates and assist with hiring tasks. Can move candidates through the pipeline, but cannot change any career settings.",
  },
  {
    value: "Reviewer",
    label: "Reviewer",
    description:
      "Reviews candidates and provides feedback. Can only view candidate profile and comment.",
  },
];

const roleDescriptions = {
  "Job Owner":
    "Leads the hiring process for assigned jobs. Has access with all career settings.",
  Contributor:
    "Helps evaluate candidates and assist with hiring tasks. Can move candidates through the pipeline, but cannot change any career settings.",
  Reviewer:
    "Reviews candidates and provides feedback. Can only view candidate profile and comment.",
};

export default function TeamAccessCard() {
  const {
    teamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    user,
  } = useCareerFormStore();

  const handleAddMember = (member: TeamMember) => {
    addTeamMember(member);
  };

  const handleRemoveMember = (memberId: string) => {
    removeTeamMember(memberId);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateTeamMemberRole(memberId, newRole);
  };

  return (
    <CareerFormCard heading="3. Team Access" icon="">
      <div className="space-y-6">
        {/* Header with description and add member button */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-sm font-semibold text-gray-700">
              Add member
            </div>
            <div className="text-sm text-gray-600">
              You can add other members to collaborate on this career.
            </div>
          </div>
          <MemberSelector
            onSelectMember={handleAddMember}
            existingMembers={teamMembers}
            placeholder="Add member"
          />
        </div>

        {/* Separator */}
        <hr className="border-gray-200" />

        {/* Team members list */}
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg"
            >
              {/* Member info */}
              <div className="flex items-center gap-3">
                <AvatarImage
                  src={
                    member.id.startsWith("owner-") ? user.image || null : null
                  }
                  alt={member.name}
                  className="avatar avatar-sm rounded-circle"
                />
                <div>
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>

              {/* Role selector and delete button */}
              <div className="flex items-center gap-3">
                {member.role === "Job Owner" ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      title={roleDescriptions["Job Owner"]}
                    >
                      Job Owner
                    </span>
                    <i
                      className="la la-info-circle text-sm text-gray-400"
                      title={roleDescriptions["Job Owner"]}
                    ></i>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RoleSelector
                      value={member.role}
                      onChange={(value) => handleRoleChange(member.id, value)}
                      options={roleOptions}
                      placeholder="Select role"
                    />
                    <i
                      className="la la-info-circle text-sm text-gray-400"
                      title={
                        roleDescriptions[
                          member.role as keyof typeof roleDescriptions
                        ]
                      }
                    ></i>
                  </div>
                )}

                {member.role !== "Job Owner" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 text-gray-400 transition-colors hover:text-red-500"
                    title="Remove member"
                  >
                    <i className="la la-trash text-lg"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CareerFormCard>
  );
}
