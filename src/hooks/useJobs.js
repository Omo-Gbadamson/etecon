import { useState, useEffect, useMemo } from "react";
import { getOpenJobs } from "../firebase/firestore";

export function useJobs(filters = {}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getOpenJobs()
      .then(j => { setJobs(j); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  }, []);

  const now = new Date();

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      // Exclude expired jobs
      if (j.applicationDeadline?.toDate && j.applicationDeadline.toDate() < now) return false;
      const q = (filters.search || "").toLowerCase();
      if (q && !j.title.toLowerCase().includes(q) && !j.schoolName?.toLowerCase().includes(q) && !j.subject?.toLowerCase().includes(q)) return false;
      if (filters.subject && j.subject !== filters.subject) return false;
      if (filters.jobType && j.jobType !== filters.jobType) return false;
      if (filters.state && j.state !== filters.state) return false;
      if (filters.educationLevel && j.educationLevelRequired !== filters.educationLevel) return false;
      if (filters.minExp && Number(j.experienceRequired) < Number(filters.minExp)) return false;
      if (filters.minSalary && j.salary?.min && j.salary.min < Number(filters.minSalary)) return false;
      return true;
    });
  }, [jobs, filters]);

  return { jobs: filtered, allJobs: jobs, loading, error };
}
