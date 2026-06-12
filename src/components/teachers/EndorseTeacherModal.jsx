import { useState } from "react";
import { addEndorsement } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Modal, Button, Select, Textarea } from "../shared";
import { toast } from "sonner";
import { SUBJECTS } from "../../utils";

export function EndorseTeacherModal({ open, onClose, teacherId, teacherName }) {
  const { user, userDoc } = useAuth();
  const [skill, setSkill] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skill) return toast.error("Please select a skill to endorse.");
    setLoading(true);
    try {
      await addEndorsement(teacherId, user.uid, userDoc?.displayName || "Anonymous", skill, note);
      toast.success(`You endorsed ${teacherName} for ${skill}!`);
      onClose();
      setSkill(""); setNote("");
    } catch { toast.error("Failed to add endorsement."); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Endorse ${teacherName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Skill / Subject to endorse"
          value={skill}
          onChange={e => setSkill(e.target.value)}
          options={SUBJECTS.map(s => ({ value: s, label: s }))}
          placeholder="Select a skill…"
        />
        <Textarea
          label="Leave a note (optional)"
          placeholder="Share why you're endorsing this teacher…"
          rows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Submit endorsement</Button>
        </div>
      </form>
    </Modal>
  );
}
