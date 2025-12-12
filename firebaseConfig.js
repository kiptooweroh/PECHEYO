// ====================
// FIREBASE CONFIG & INITIALIZATION
// ====================

// Replace these values with your Firebase project keys
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_APP.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore and Auth references
const db = firebase.firestore();
const auth = firebase.auth();

// ====================
// REAL-TIME ANNOUNCEMENTS FUNCTIONS
// ====================
function listenToAnnouncements(latestContainer, allContainer) {
    db.collection("announcements")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            if (latestContainer) latestContainer.innerHTML = "";
            if (allContainer) allContainer.innerHTML = "";

            let first = true;
            snapshot.forEach(doc => {
                const data = doc.data();
                const card = `
                <div class="announcement-card">
                    <h3>${data.title}</h3>
                    <p>${data.message}</p>
                    <small>${data.timestamp ? data.timestamp.toDate().toLocaleString() : "Just now"}</small>
                </div>
              `;

                if (first && latestContainer) {
                    latestContainer.innerHTML = card;
                    first = false;
                }

                if (allContainer) {
                    allContainer.innerHTML += card;
                }
            });
        });
}

function postAnnouncement(title, message) {
    return db.collection("announcements").add({
        title,
        message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}
