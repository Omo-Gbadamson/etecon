import { useState, useEffect, useCallback } from "react";
import { getSavedJobIds, saveJob, unsaveJob, getOpenJobs } from "../firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useSavedJobs() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const ids = await getSavedJobIds(user.uid);
    setSavedIds(new Set(ids));

    if (ids.length > 0) {
      const allJobs = await getOpenJobs();
      setSavedJobs(allJobs.filter(j => ids.includes(j.id)));
    } else {
      setSavedJobs([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleSave = async (jobId) => {
    if (!user) return;
    const isSaved = savedIds.has(jobId);
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(jobId) : next.add(jobId);
      return next;
    });
    try {
      if (isSaved) {
        await unsaveJob(user.uid, jobId);
        setSavedJobs(prev => prev.filter(j => j.id !== jobId));
      } else {
        await saveJob(user.uid, jobId);
        await refresh();
      }
    } catch {
      // Revert
      setSavedIds(prev => {
        const next = new Set(prev);
        isSaved ? next.add(jobId) : next.delete(jobId);
        return next;
      });
    }
  };

  return { savedIds, savedJobs, loading, toggleSave, isSaved: (id) => savedIds.has(id) };
}
