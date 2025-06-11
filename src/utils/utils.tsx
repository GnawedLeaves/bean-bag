import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
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

export const convertMsToSeconds = (ms?: number): number => {
  if (!ms) return 1;
  return Math.floor(ms / 1000);
};

export const formatReleaseDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const convertISOToDayjs = (isoString: string) => {
  return dayjs(isoString);
};
