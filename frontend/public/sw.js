importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
  projectId: "pushy-tushy",
  messagingSenderId: "442449621900",
  appId: "1:442449621900:web:b87ce9887439fe98bedca9",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This handles background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});