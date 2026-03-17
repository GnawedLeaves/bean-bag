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
    message: "Server is very healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + "s" 

  });

})

// --- ENDPOINT: SAVE SUBSCRIPTION TO FIRESTORE ---
app.post('/subscribe', async (req, res) => {
  const { subscription, userId } = req.body; 

  try {
    const snapshot = await db.collection('anniAppPushSubscriptions')
      .where('endpoint', '==', subscription.endpoint)
      .get();


    if (snapshot.empty) {
      await db.collection('anniAppPushSubscriptions').add({
        ...subscription,
        userId: userId || 'anonymous',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ "error when subscribing: ": err.message });
  }
});

// --- ENDPOINT: HYGRAPH WEBHOOK ---
app.post('/hygraph-webhook', async (req, res) => {

  //check header for secret
  const secret = req.headers['HygraphSecret'];
  if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
    console.error("Unauthorized webhook attempt blocked.");
    return res.status(401).send('Unauthorizedd!!!!');
  }
  const { data, operation } = req.body;

  if (operation !== 'publish') return res.status(200).send('No action');

  try {
    const notificationPayload = JSON.stringify({
      title: 'New Bean!',
      body: `${data.username || 'Someone'} just added a new bean entry!`,
      url: `/spotify/track/${data.spotifyId}`
    });

    const snapshot = await db.collection('push_subscriptions').get();
    
    const notifications = snapshot.docs.map(doc => {
      const sub = doc.data();
      return webpush.sendNotification(sub, notificationPayload)
        .catch(async (err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
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

app.post('/test-send-notification', (req, res) => {
  const notificationPayload = JSON.stringify({
    title: req.body.title || 'Default Title',
    body: req.body.body || 'Default message body',
    url: '/dashboard'
  });
  

  const promises = subscriptions.map(sub => 
    webpush.sendNotification(sub, notificationPayload)
      .catch(err => {
        console.error("Error sending to endpoint:", sub.endpoint, err);
        // If the subscription is expired or invalid, remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      })
  );

  Promise.all(promises).then(() => res.json({ message: 'Notifications sent!' }));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));