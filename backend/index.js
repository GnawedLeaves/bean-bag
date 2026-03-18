require('dotenv').config();
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

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
      icon: iconUrl,
      badge: iconUrl, 
      url: `/blogs`
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


// --- ENDPOINT: ADD SPOTIFY REVIEW WITH NOTIFICATIONS ---
app.post('/add-spotify-review', async (req, res) => {
  const { userId, username, spotifyId, rating, trackName, artistName } = req.body;

  // Validation
  if (!userId || !spotifyId || rating === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const reviewData = {
      rating: rating,
      userId: userId,
      spotifyId: spotifyId,
      dateAdded: admin.firestore.Timestamp.now(),
      type: "track",
    };

       const docRef = await db.collection("anniAppSpotifyReview").add(reviewData);
      docId = docRef.id;

    // Send push notifications
    const notificationPayload = JSON.stringify({
      title: 'New Beanify rating!',
      body: `${username} rated "${trackName}" by ${artistName} - ${rating} stars`,
      url: `/spotify/track/${spotifyId}`
    });

    const snapshot = await db.collection('anniAppPushSubscriptions').get();

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

    res.status(201).json({ 
      message: 'Review added successfully',
      docId: docId 
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review', details: error.message });
  }
});

// --- ENDPOINT: ADD SPOTIFY COMMENT WITH NOTIFICATIONS ---
app.post('/add-spotify-comment', async (req, res) => {
  const { userId, spotifyId, content, trackName, username,type } = req.body;

  // Validation
  if (!userId || !spotifyId || !content?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const commentData = {
      content: content.trim(),
      userId: userId,
      spotifyId: spotifyId,
      dateAdded: admin.firestore.Timestamp.now(),
      type: type,
    };
    const database = db.collection("anniAppSpotifyReviewComment");
    const docRef = await database.add(commentData);


    // Send push notifications
    const notificationPayload = JSON.stringify({
      title: `New Beanify comment on ${trackName}`,
      body: `${username} commented: "${content.substring(0, 50)}..."`,
      url: `/spotify/track/${spotifyId}`
    });

    const snapshot = await db.collection('anniAppPushSubscriptions').get();

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

    res.status(201).json({ 
      message: 'Comment added successfully',
      docId: docRef.id 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));