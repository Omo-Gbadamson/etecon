import { useMemo } from "react";

export function useProfileCompleteness(profile, role) {
  return useMemo(() => {
    if (!profile) return { percent: 0, missing: [], complete: false };

    if (role === "teacher") {
      const checks = [
        { field: "fullName", label: "Full name" },
        { field: "headline", label: "Professional headline" },
        { field: "bio", label: "Bio" },
        { field: "photoURL", label: "Profile photo" },
        { field: "cvURL", label: "CV / Resume" },
        { field: "state", label: "Location (state)" },
        { field: "city", label: "Location (city)" },
        { field: "educationLevel", label: "Education level" },
        { check: () => profile.subjects?.length > 0, label: "At least one subject" },
        { field: "availability", label: "Availability status" },
      ];
      const done = checks.filter(c => c.check ? c.check() : !!profile[c.field]);
      const missing = checks.filter(c => !(c.check ? c.check() : !!profile[c.field])).map(c => c.label);
      const percent = Math.round((done.length / checks.length) * 100);
      return { percent, missing, complete: percent >= 80 };
    }

    if (role === "school") {
      const checks = [
        { field: "schoolName", label: "School name" },
        { field: "schoolType", label: "School type" },
        { field: "description", label: "School description" },
        { field: "logoURL", label: "School logo" },
        { field: "state", label: "Location (state)" },
        { field: "city", label: "Location (city)" },
        { field: "contactEmail", label: "Contact email" },
        { field: "contactPhone", label: "Contact phone" },
      ];
      const done = checks.filter(c => !!profile[c.field]);
      const missing = checks.filter(c => !profile[c.field]).map(c => c.label);
      const percent = Math.round((done.length / checks.length) * 100);
      return { percent, missing, complete: percent >= 80 };
    }

    return { percent: 0, missing: [], complete: false };
  }, [profile, role]);
}
