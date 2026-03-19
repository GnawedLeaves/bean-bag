const useNavbarController = () => {
  const API_BASE_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const wakeUpServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log("wake up server", response);
    } catch (e) {
      console.error("Error waking up server");
    }
  };

  return { wakeUpServer };
};

export default useNavbarController;
