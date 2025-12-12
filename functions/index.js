const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendNotification = functions.https.onRequest((req, res) => {
  const token = req.body.token;
  const title = req.body.title;

  const message = {
    notification: {
      title: "New Church Announcement",
      body: title,
    },
    token: token,
  };

  admin.messaging().send(message)
      .then(() => res.status(200).send("Sent"))
      .catch((err) => res.status(500).send(err));
});

