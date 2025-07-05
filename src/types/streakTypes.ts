import { Timestamp } from "firebase/firestore";

export interface StreakModel {
  id?: string;
  isDelete: boolean;
  prevDate: Timestamp;
  prevPrevDate: Timestamp;
  streakName: string;
  userId: string;
}
