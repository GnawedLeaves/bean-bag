require("dotenv").config();
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const express = require("express");
const webpush = require("web-push");
const cors = require("cors");
const admin = require("firebase-admin");
const { request } = require("graphql-request");

const { db } = require("./service/firebaseAdmin");

const app = express();
app.use(cors());
app.use(express.json());

webpush.setVapidDetails(
  "mailto:marcelyap31@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
);

/**
 * Sends a push notification to all subscribers EXCEPT the sender.
 * @param {Object} payload - { title, body, url, icon }
 * @param {string} senderId - The ID of the user performing the action.
 */
const sendGlobalNotification = async (payload, senderId = null) => {
  try {
    const notificationPayload = JSON.stringify({
      title: payload.title || "New Update!",
      body: payload.body || "Check out what's new in the app.",
      icon: payload.icon || "/icon-192x192.png",
      badge: payload.badge || "/badge-72x72.png",
      url: payload.url || "/",
    });

    const snapshot = await db.collection("anniAppPushSubscriptions").get();

    if (snapshot.empty) return;

    const notifications = snapshot.docs
      .map((doc) => {
        const sub = doc.data();

        if (senderId && sub.userId === senderId) {
          return null;
        }

        return webpush
          .sendNotification(sub, notificationPayload)
          .catch(async (err) => {
            console.error(
              "Error sending to endpoint:",
              sub.endpoint,
              err.statusCode,
            );
            // Clean up expired subscriptions
            if (err.statusCode === 404 || err.statusCode === 410) {
              await db
                .collection("anniAppPushSubscriptions")
                .doc(doc.id)
                .delete();
            }
          });
      })
      .filter((p) => p !== null); // Remove the nulls from the array

    await Promise.all(notifications);
    console.log(`Notifications sent! (Excluded sender: ${senderId || "None"})`);
  } catch (err) {
    console.error("Global Notification Helper Error:", err);
  }
};

const HYGRAPH_API_KEY = process.env.HYGRAPH_API_KEY || "";
const HYGRAPH_API_URL = process.env.HYGRAPH_API_URL || "";

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
      },
    );
    return data.blogEntry;
  } catch (error) {
    console.error("Error fetching blog entry from Hygraph:", error);
    throw error;
  }
};

app.get("/health", async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is very healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + "s",
  });
  console.log("server is healthy!!!");
});

// --- ENDPOINT: SAVE SUBSCRIPTION TO FIRESTORE ---
app.post("/subscribe", async (req, res) => {
  const { subscription, userId } = req.body;

  try {
    const snapshot = await db
      .collection("anniAppPushSubscriptions")
      .where("endpoint", "==", subscription.endpoint)
      .get();

    if (snapshot.empty) {
      await db.collection("anniAppPushSubscriptions").add({
        ...subscription,
        userId: userId || "anonymous",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    res.status(500).json({ "error when subscribing: ": err.message });
  }
});

// --- ENDPOINT: HYGRAPH WEBHOOK ---
app.post("/hygraph-webhook", async (req, res) => {
  //check header for secret
  const secret = req.headers["hygraphsecret"];
  if (secret !== process.env.HYGRAPH_WEBHOOK_SECRET) {
    console.error("Unauthorized webhook attempt blocked.");
    return res.status(401).send("Unauthorizedd!!!!");
  }

  const { data, operation } = req.body;
  const blogId = data.id ?? "";

  if (operation !== "publish") return res.status(200).send("No action");

  try {
    const blogEntry = await getBlogEntryById(blogId);

    if (!blogEntry) {
      return res.status(404).json({ message: "Blog entry not found" });
    }

    await sendGlobalNotification({
      title: "New Bean!",
      body: blogEntry.title,
      icon: blogEntry.images?.[0]?.url,
      url: `/blogs`,
    });

    console.log("hygraph notifs sent!!", blogEntry.title);
    res.status(200).json({ message: "hygraph notifications processed" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/test-send-notification", async (req, res) => {
  try {
    const notificationPayload = JSON.stringify({
      title: req.body.title || "Default Title",
      body: req.body.body || "Default message body",
      url: "/",
    });

    const snapshot = await db.collection("anniAppPushSubscriptions").get();

    if (snapshot.empty) {
      return res
        .status(200)
        .json({ message: "No subscribers found in database." });
    }

    const notifications = snapshot.docs.map((doc) => {
      const sub = doc.data();
      return webpush
        .sendNotification(sub, notificationPayload)
        .catch(async (err) => {
          console.error("Error sending to endpoint:", sub.endpoint, err);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db
              .collection("anniAppPushSubscriptions")
              .doc(doc.id)
              .delete();
          }
        });
    });

    await Promise.all(notifications);
    console.log("test notifs sent!!");
    res.json({ message: "test Notifications processed!" });
  } catch (err) {
    console.error("Server Crash Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// --- ENDPOINT: ADD SPOTIFY REVIEW WITH NOTIFICATIONS ---
app.post("/add-spotify-review", async (req, res) => {
  const { userId, username, spotifyId, rating, trackName, artistName, type } =
    req.body;

  // Validation
  if (!userId || !spotifyId || !type || rating === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const reviewData = {
      rating: rating,
      userId: userId,
      spotifyId: spotifyId,
      dateAdded: admin.firestore.Timestamp.now(),
      type: type,
    };

    let body = "";
    switch (type) {
      case "track":
        body = `${username} rated track: "${trackName}" by ${artistName} - ${rating} ${rating > 1 ? "stars" : "star"}`;
        break;
      case "artist":
        body = `${username} rated artist: "${trackName}" - ${rating} ${rating > 1 ? "stars" : "star"}`;
        break;

      case "album":
        body = `${username} rated album: "${trackName}" by ${artistName} - ${rating} ${rating > 1 ? "stars" : "star"}`;
        break;

      case "playlist":
        body = `${username} rated playlist: "${trackName}"  - ${rating} ${rating > 1 ? "stars" : "star"}`;
        break;

      default:
        body = ``;
        break;
    }

    console.log({ body });

    const docRef = await db.collection("anniAppSpotifyReview").add(reviewData);
    docId = docRef.id;

    await sendGlobalNotification(
      {
        title: "New Beanify rating!",
        body: body,
        url: `/spotify/track/${spotifyId}`,
      },
      userId,
    );

    res.status(201).json({
      message: "Review added successfully",
      docId: docId,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res
      .status(500)
      .json({ error: "Failed to add review", details: error.message });
  }
});

// --- ENDPOINT: ADD SPOTIFY COMMENT WITH NOTIFICATIONS ---
app.post("/add-spotify-comment", async (req, res) => {
  const { userId, spotifyId, content, trackName, username, type } = req.body;

  // Validation
  if (!userId || !spotifyId || !type || !content?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
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

    let notifObj = {
      title: `New Beanify comment`,
      body: `${username} commented: "${content.substring(0, 50)}..."`,
      url: `/spotify`,
    };
    switch (type) {
      case "track":
        notifObj = {
          title: `New comment on track: ${trackName}`,
          body: `${username} commented: "${content.substring(0, 50)}..."`,
          url: `/spotify/${type}/${spotifyId}`,
        };
        break;
      case "artist":
        notifObj = {
          title: `New comment on artist: ${trackName}`,
          body: `${username} commented: "${content.substring(0, 50)}..."`,
          url: `/spotify/${type}/${spotifyId}`,
        };
        break;

      case "album":
        notifObj = {
          title: `New comment on album: ${trackName}`,
          body: `${username} commented: "${content.substring(0, 50)}..."`,
          url: `/spotify/${type}/${spotifyId}`,
        };
        break;

      case "playlist":
        notifObj = {
          title: `New comment on playlist: ${trackName}`,
          body: `${username} commented: "${content.substring(0, 50)}..."`,
          url: `/spotify/${type}/${spotifyId}`,
        };
        break;

      default:
        break;
    }

    await sendGlobalNotification(notifObj, userId);

    res.status(201).json({
      message: "Comment added successfully",
      docId: docRef.id,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .json({ error: "Failed to add comment", details: error.message });
  }
});

app.post("/add-bean-comment", async (req, res) => {
  const { blogEntryId, userId, content, isDelete, blogTitle } = req.body;
  if (!req.body) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const commentBody = {
    blogEntryId,
    userId,
    content,
    dateAdded: admin.firestore.Timestamp.now(),
    isDelete,
  };
  try {
    const database = db.collection("anniAppBeansComments");
    const docRef = await database.add(commentBody);

    await sendGlobalNotification(
      {
        title: `New Bean comment on ${blogTitle}`,
        body: `"${content.substring(0, 50)}"`,
        url: `/blogs`,
      },
      userId,
    );

    console.log("hygraph notifs sent!!", blogTitle);
    res.status(201).json({
      message: "Bean Comment added successfully",
      docId: docRef.id,
    });
  } catch (error) {
    console.error("Error adding bean comment:", error);
    res
      .status(500)
      .json({ error: "Failed to add bean comment", details: error.message });
  }
});

app.post("/reset-streak", async (req, res) => {
  const { streak, userId } = req.body;
  console.log({ streak });
  if (!req.body || !streak) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const table = db.collection("anniAppStreak");
    const docRef = table.doc(streak.id);

    console.log("trying to update doc");
    await docRef.update({
      prevDate: new Date(),
      prevPrevDate: streak.prevDate,
    });

    console.log("updated doc");

    await sendGlobalNotification(
      {
        title: `${streak.streakName} has been reset!`,
        body: `uh oh someone lost their ${streak.timeDifference} day(s) streak!`,
        url: `/home`,
      },
      userId,
    );
    console.log("sent notif");

    console.log("successfully reset streak", streak.streakName);
    return res.status(201).json({
      success: true,
      message: `Successfully reset streak: ${streak.streakName}`,
    });
  } catch (e) {
    console.error("Error resetting streak", e);
    res.status(500).json({
      error: "Failed to reset streak",
      details: e.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
