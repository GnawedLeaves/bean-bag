import { useCallback, useState } from "react";
import { StreakModel } from "../../types/streakTypes";
interface UseHomeControllerProps {
  onResetStreak: () => void;
}

interface ResetStreakParams {
  streak: StreakModel;
  userId?: string;
}
const useHomeController = ({ onResetStreak }: UseHomeControllerProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const API_BASE_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  //   const API_BASE_URL = "http://localhost:5000";
  const resetStreak = useCallback(
    async (params: ResetStreakParams) => {
      setIsLoading(true);
      const { streak, userId } = params;
      if (!params || !userId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/reset-streak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            streak,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to reset streak");
        }
        onResetStreak();
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to reset streak on fe", e);
        window.alert(`Failed to reset streak, ${e}`);
        throw new Error("Failed to reset streak" + e);
      }
    },
    [API_BASE_URL, onResetStreak],
  );
  return { isLoading, resetStreak };
};

export default useHomeController;
