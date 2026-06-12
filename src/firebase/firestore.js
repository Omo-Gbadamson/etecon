import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, onSnapshot, runTransaction,
  increment
} from "firebase/firestore";
import { db } from "./config";

// ─── Teachers ─────────────────────────────────────────────────────────────
export async function setTeacherProfile(uid, data) {
  await setDoc(doc(db, "teachers", uid), {
    ...data,
    uid,
    updatedAt: serverTimestamp(),
    createdAt: data.createdAt || serverTimestamp(),
  }, { merge: true });
}

export async function getTeacherProfile(uid) {
  const snap = await getDoc(doc(db, "teachers", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getPublicTeachers() {
  const q = query(collection(db, "teachers"), where("isProfilePublic", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Schools ──────────────────────────────────────────────────────────────
export async function setSchoolProfile(uid, data) {
  await setDoc(doc(db, "schools", uid), {
    ...data,
    uid,
    createdAt: data.createdAt || serverTimestamp(),
  }, { merge: true });
}

export async function getSchoolProfile(uid) {
  const snap = await getDoc(doc(db, "schools", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────
export async function createJob(schoolId, data) {
  const ref = await addDoc(collection(db, "jobs"), {
    ...data,
    schoolId,
    applicantsCount: 0,
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateJob(jobId, data) {
  await updateDoc(doc(db, "jobs", jobId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteJob(jobId) {
  await deleteDoc(doc(db, "jobs", jobId));
}

export async function getJob(jobId) {
  const snap = await getDoc(doc(db, "jobs", jobId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getOpenJobs() {
  const q = query(
    collection(db, "jobs"),
    where("status", "==", "open"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSchoolJobs(schoolId) {
  const q = query(collection(db, "jobs"), where("schoolId", "==", schoolId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToSchoolJobs(schoolId, cb) {
  const q = query(collection(db, "jobs"), where("schoolId", "==", schoolId), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// ─── Applications ─────────────────────────────────────────────────────────
export async function applyToJob(jobId, teacherId, schoolId, data) {
  const appRef = doc(collection(db, "applications"));
  await runTransaction(db, async (tx) => {
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await tx.get(jobRef);
    if (!jobSnap.exists()) throw new Error("Job not found");
    tx.set(appRef, {
      jobId, teacherId, schoolId, ...data,
      status: "pending",
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      schoolNote: null,
    });
    tx.update(jobRef, { applicantsCount: increment(1) });
  });
  // Notify school
  await addDoc(collection(db, "notifications"), {
    userId: schoolId,
    type: "application_received",
    message: `${data.teacherName} applied for "${data.jobTitle}"`,
    relatedId: jobId,
    read: false,
    createdAt: serverTimestamp(),
  });
  return appRef.id;
}

export async function updateApplicationStatus(appId, status, schoolNote = null) {
  const data = { status, updatedAt: serverTimestamp() };
  if (schoolNote !== null) data.schoolNote = schoolNote;
  const appRef = doc(db, "applications", appId);
  await updateDoc(appRef, data);
  // Notify teacher
  const snap = await getDoc(appRef);
  if (snap.exists()) {
    const app = snap.data();
    const statusLabels = {
      reviewed: "has been reviewed",
      shortlisted: "has been shortlisted 🎉",
      hired: "has been accepted — you're hired! 🏆",
      rejected: "was not selected this time",
    };
    if (statusLabels[status]) {
      await addDoc(collection(db, "notifications"), {
        userId: app.teacherId,
        type: "application_status_changed",
        message: `Your application for "${app.jobTitle}" ${statusLabels[status]}`,
        relatedId: appId,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  }
}

export async function getTeacherApplications(teacherId) {
  const q = query(collection(db, "applications"), where("teacherId", "==", teacherId), orderBy("appliedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getJobApplications(jobId) {
  const q = query(collection(db, "applications"), where("jobId", "==", jobId), orderBy("appliedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSchoolApplications(schoolId) {
  const q = query(collection(db, "applications"), where("schoolId", "==", schoolId), orderBy("appliedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToTeacherApplications(teacherId, cb) {
  const q = query(collection(db, "applications"), where("teacherId", "==", teacherId), orderBy("appliedAt", "desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeToSchoolApplications(schoolId, cb) {
  const q = query(collection(db, "applications"), where("schoolId", "==", schoolId), orderBy("appliedAt", "desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// ─── Notifications ────────────────────────────────────────────────────────
export async function createNotification(userId, type, message, relatedId) {
  await addDoc(collection(db, "notifications"), {
    userId, type, message, relatedId, read: false, createdAt: serverTimestamp(),
  });
}

export function subscribeToNotifications(userId, cb) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

// ─── User doc ─────────────────────────────────────────────────────────────
export async function updateUserDoc(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

// ─── Saved Jobs ───────────────────────────────────────────────────────────
export async function saveJob(teacherId, jobId) {
  await setDoc(doc(db, "savedJobs", `${teacherId}_${jobId}`), {
    teacherId, jobId, savedAt: serverTimestamp(),
  });
}

export async function unsaveJob(teacherId, jobId) {
  await deleteDoc(doc(db, "savedJobs", `${teacherId}_${jobId}`));
}

export async function getSavedJobIds(teacherId) {
  const q = query(collection(db, "savedJobs"), where("teacherId", "==", teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().jobId);
}

export async function isJobSaved(teacherId, jobId) {
  try {
    const snap = await getDoc(doc(db, "savedJobs", `${teacherId}_${jobId}`));
    return snap.exists();
  } catch { return false; }
}

// ─── Messages ─────────────────────────────────────────────────────────────
export async function getOrCreateConversation(teacherId, schoolId, jobId) {
  const convId = [teacherId, schoolId, jobId].sort().join("_");
  const ref = doc(db, "conversations", convId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id: convId, teacherId, schoolId, jobId,
      lastMessage: null, lastMessageAt: null,
      createdAt: serverTimestamp(),
      participants: [teacherId, schoolId],
    });
  }
  return convId;
}

export async function sendMessage(convId, senderId, text) {
  const ref = await addDoc(collection(db, "conversations", convId, "messages"), {
    senderId, text: text.trim(), sentAt: serverTimestamp(), read: false,
  });
  await updateDoc(doc(db, "conversations", convId), {
    lastMessage: text.trim(), lastMessageAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToMessages(convId, cb) {
  const q = query(
    collection(db, "conversations", convId, "messages"),
    orderBy("sentAt", "asc")
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeToConversations(userId, cb) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function markMessagesRead(convId, userId) {
  const q = query(
    collection(db, "conversations", convId, "messages"),
    where("senderId", "!=", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const batch = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(batch);
}

// ─── Endorsements ─────────────────────────────────────────────────────────
export async function addEndorsement(teacherId, fromUid, fromName, skill, note) {
  const ref = await addDoc(collection(db, "teachers", teacherId, "endorsements"), {
    fromUid, fromName, skill, note: note || "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getEndorsements(teacherId) {
  const snap = await getDocs(collection(db, "teachers", teacherId, "endorsements"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function checkAlreadyApplied(teacherId, jobId) {
  const q = query(
    collection(db, "applications"),
    where("jobId", "==", jobId),
    where("teacherId", "==", teacherId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
