require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const admin = require('firebase-admin');
const { request } = require('graphql-request');

const { db } = require('./service/firebaseAdmin');

const app = express();
app.use(cors());
app.use(express.json());

webpush.setVapidDetails(
  'mailto:marcelyap31@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

const HYGRAPH_API_KEY = process.env.HYGRAPH_API_KEY || '';
const HYGRAPH_API_URL = process.env.HYGRAPH_API_URL || '';

// Function to fetch blog entry by ID from Hygraph
const getBlogEntryById = async (blogId) => {
  const query = `
    query GetBlogEntry($id: ID!) {
      blogEntry(where: { id: $id }) {
        id
        title
        content
        timestamp
        images {
          url
          fileName
        }
        location {
          latitude
          longitude
        }
      }
    }
  `;

  try {
    const data = await request(
      HYGRAPH_API_URL,
      query,
      { id: blogId },
      {
        Authorization: `Bearer ${HYGRAPH_API_KEY}`,
      }
    );
    return data.blogEntry;
  } catch (error) {
    console.error('Error fetching blog entry from Hygraph:', error);
    throw error;
  }
};

app.get("/", async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is very healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + "s"
  });
});

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
  const secret = req.headers['hygraphsecret'];
  if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
    console.error("Unauthorized webhook attempt blocked.");
    return res.status(401).send('Unauthorizedd!!!!');
  }

  const { data, operation } = req.body;
  const blogId = data.id ?? "";

  if (operation !== 'publish') return res.status(200).send('No action');

  try {
    const blogEntry = await getBlogEntryById(blogId);

    if (!blogEntry) {
      return res.status(404).json({ message: 'Blog entry not found' });
    }

    console.log({blogEntry})

    // Get the first image URL if available
    const iconUrl = blogEntry.images && blogEntry.images.length > 0 
      ? blogEntry.images[0].url 
      : undefined;

    const notificationPayload = JSON.stringify({
      title: 'New Bean!',
      body: blogEntry.title || 'Someone just added a new bean entry!',
      icon: iconUrl, // Add custom icon
      badge: iconUrl, // Badge icon for smaller displays
      url: `/blogs/${blogId}`
    });

    const snapshot = await db.collection('anniAppPushSubscriptions').get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No subscribers found in database.' });
    }

    const notifications = snapshot.docs.map(doc => {
      const sub = doc.data();
      return webpush.sendNotification(sub, notificationPayload)
        .catch(async (err) => {
          console.error('Error sending notification:', err);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.collection('anniAppPushSubscriptions').doc(doc.id).delete();
          }
        });
    });

    await Promise.all(notifications);
    console.log("hygraph notifs sent!!", blogEntry.title);
    res.status(200).json({ message: 'hygraph notifications processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal Server Error');
  }
});
// ...existing code...

app.post('/test-send-notification', async (req, res) => {
  try {
    const notificationPayload = JSON.stringify({
      title: req.body.title || 'Default Title',
      body: req.body.body || 'Default message body',
      url: '/'
    });

    const snapshot = await db.collection('anniAppPushSubscriptions').get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No subscribers found in database.' });
    }

    const notifications = snapshot.docs.map(doc => {
      const sub = doc.data();
      return webpush.sendNotification(sub, notificationPayload)
        .catch(async (err) => {
          console.error("Error sending to endpoint:", sub.endpoint, err);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.collection('anniAppPushSubscriptions').doc(doc.id).delete();
          }
        });
    });

    await Promise.all(notifications);
    console.log("test notifs sent!!");
    res.json({ message: 'test Notifications processed!' });
  } catch (err) {
    console.error("Server Crash Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));