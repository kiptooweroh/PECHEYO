importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
    apiKey: "YOUR_API_KEY",
    projectId: "YOUR_PROJECT_ID",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {
    return self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body
    });
});
