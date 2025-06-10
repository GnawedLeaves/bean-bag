import { Timestamp } from "firebase/firestore";

export function firebaseDateToJS(date: Timestamp | null): Date | null {
  if (!date) return null;
  return date.toDate();
}

export function formatFirebaseDate(date: Timestamp | null): string {
  if (!date) return "";

  const jsDate = date.toDate();

  const day = jsDate.getDate().toString().padStart(2, "0");
  const month = jsDate.toLocaleString("default", { month: "short" }); // e.g., "Jun"
  const year = jsDate.getFullYear();
  const hours = jsDate.getHours().toString().padStart(2, "0");
  const minutes = jsDate.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export const formatMilliseconds = (ms?: number): string => {
  if (!ms) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  } else {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
};
