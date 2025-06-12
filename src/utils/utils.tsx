import { Timestamp, GeoPoint } from "firebase/firestore";
import dayjs from "dayjs";
export function firebaseDateToJS(date: Timestamp | null): Date | null {
  if (!date) return null;
  return date.toDate();
}

export function formatFirebaseDate(date: Timestamp | null | undefined): string {
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

export const convertISOToDDMMYYYHHmm = (isoString: string): string => {
  return dayjs(isoString).format("DD MMM YYYY HH:mm");
};

export const convertISOToDDMMYYY = (isoString: string): string => {
  return dayjs(isoString).format("DD/MM/YYYY");
};

export const calculateDistance = (
  point1: GeoPoint,
  point2: GeoPoint
): string => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180; // φ, λ in radians
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in metres

  // Format the output based on the distance
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`;
  }
  return `${Math.round(distance).toFixed(2)}m`;
};

export const addLineBreaksAfterSentences = (text: string): string => {
  const abbreviations = ["Dr", "Mr", "Mrs", "Ms", "Prof", "Sr", "Jr", "vs"];
  let processedText = text;

  // First, temporarily replace periods in abbreviations
  abbreviations.forEach((abbr) => {
    const regex = new RegExp(`${abbr}\\.`, "g");
    processedText = processedText.replace(regex, `${abbr}@@@`);
  });

  // Replace periods followed by space and capital letter with period + double newline
  processedText = processedText.replace(/\.\s+([A-Z])/g, ".\n\n$1");

  // Restore the original abbreviations
  abbreviations.forEach((abbr) => {
    const regex = new RegExp(`${abbr}@@@`, "g");
    processedText = processedText.replace(regex, `${abbr}.`);
  });

  return processedText;
};
