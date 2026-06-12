import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export function uploadFile(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      snap => onProgress && onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function uploadAvatar(uid, file) {
  if (file.size > 2 * 1024 * 1024) throw new Error("Photo must be under 2MB");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Only JPG/PNG/WEBP allowed");
  return uploadFile(`avatars/${uid}/${Date.now()}_${file.name}`, file);
}

export async function uploadCV(uid, file) {
  if (file.size > 5 * 1024 * 1024) throw new Error("CV must be under 5MB");
  if (file.type !== "application/pdf") throw new Error("Only PDF files allowed");
  return uploadFile(`cvs/${uid}/${Date.now()}_${file.name}`, file);
}
