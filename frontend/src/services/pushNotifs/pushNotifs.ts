const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribePushNotifs = async (userId: string) => {
  try {
    // 1. Register the worker first
    const register = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // 2. Request permission AFTER service worker is registered
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Push notification permission denied");
    }

    // 3. Now subscribe using the registered service worker
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // 4. Send to your backend
    await fetch(`${BACKEND_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription,
        userId: userId || "anonymous",
      }),
    });

    console.log("Successfully subscribed to push notifications!");
  } catch (error) {
    console.error("Subscription failed:", error);
    return error;
    throw error;
  }
};
