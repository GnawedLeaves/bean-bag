require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const admin = require('firebase-admin');

const { db } = require('./service/firebaseAdmin');

const app = express();
app.use(cors());
app.use(express.json());

webpush.setVapidDetails(
  'mailto:marcelyap31@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

app.get("/", async (req,res) => {
    res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + "s" // Tells you how long the server has been running
  });
})

// --- ENDPOINT: SAVE SUBSCRIPTION TO FIRESTORE ---
app.post('/subscribe', async (req, res) => {
  const { subscription, userId } = req.body; // Pass userId from FE

  try {
    // Query to see if this endpoint already exists to avoid duplicates
    const snapshot = await db.collection('push_subscriptions')
      .where('endpoint', '==', subscription.endpoint)
      .get();

    if (snapshot.empty) {
      await db.collection('push_subscriptions').add({
        ...subscription,
        userId: userId || 'anonymous',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ENDPOINT: HYGRAPH WEBHOOK ---
app.post('/hygraph-webhook', async (req, res) => {
  const { data, operation } = req.body;

  // Only trigger on publish
  if (operation !== 'publish') return res.status(200).send('No action');

  try {
    const notificationPayload = JSON.stringify({
      title: 'New Bean!',
      body: `${data.username || 'Someone'} just added a new bean entry!`,
      url: `/spotify/track/${data.spotifyId}`
    });

    // Fetch ALL subscriptions from Firestore
    const snapshot = await db.collection('push_subscriptions').get();
    
    const notifications = snapshot.docs.map(doc => {
      const sub = doc.data();
      return webpush.sendNotification(sub, notificationPayload)
        .catch(async (err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Clean up expired subscriptions from Firebase
            await db.collection('push_subscriptions').doc(doc.id).delete();
          }
        });
    });

    await Promise.all(notifications);
    res.status(200).json({ message: 'Notifications processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));