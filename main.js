// ====================
// EMULATOR CONFIG
// ====================
if (location.hostname === "localhost") {
    console.log("Using Firebase Emulators...");

    // Auth
    firebase.auth().useEmulator("http://localhost:9099");

    // Firestore
    firebase.firestore().useEmulator("localhost", 8080);

    // Functions
    firebase.app().functions().useEmulator("localhost", 5001);
}

// ====================
// AUTH PROTECTION & SECRETARY CHECK
// ====================
firebase.auth().onAuthStateChanged(user => {
    const announcementForm = document.getElementById("announcementForm");

    // If on announcements page, require secretary login
    if (announcementForm) {
        if (!user || user.email !== "secretary@pecheyo.com") {
            window.location.href = "login.html";
        } else {
            console.log("Secretary logged in");
        }
    }
});

// Logout button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        firebase.auth().signOut().then(() => {
            window.location.href = "login.html";
        });
    });
}

// ====================
// ANNOUNCEMENT FORM LOGIC
// ====================
const form = document.getElementById("announcementForm");
const list = document.getElementById("announcementList");

if (form) {
    // Post announcement
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const message = document.getElementById("message").value;

        try {
            await firebase.firestore().collection("announcements").add({
                title,
                message,
                date: new Date().toLocaleString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            sendPushNotification(title);
            alert("Announcement posted!");
            form.reset();
        } catch (err) {
            console.error("Error posting announcement:", err);
        }
    });

    // Real-time announcement listener
    firebase.firestore().collection("announcements")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            list.innerHTML = "";

            snapshot.forEach(doc => {
                const a = doc.data();
                const id = doc.id;

                list.innerHTML += `
                    <div class="announcement-box">
                        <h3>${a.title}</h3>
                        <small>${a.date || "No date"}</small>
                        <p>${a.message}</p>
                        <button onclick="editAnnouncement('${id}', \`${a.title}\`, \`${a.message}\`)">Edit</button>
                        <button onclick="deleteAnnouncement('${id}')">Delete</button>
                    </div>
                `;
            });
        });
}

// ====================
// EDIT ANNOUNCEMENT
// ====================
function editAnnouncement(id, oldTitle, oldMessage) {
    const newTitle = prompt("Edit Title:", oldTitle);
    const newMessage = prompt("Edit Message:", oldMessage);

    if (newTitle && newMessage) {
        firebase.firestore().collection("announcements").doc(id).update({
            title: newTitle,
            message: newMessage,
            date: new Date().toLocaleString()
        });
    }
}

// ====================
// DELETE ANNOUNCEMENT
// ====================
function deleteAnnouncement(id) {
    if (confirm("Are you sure you want to delete this announcement?")) {
        firebase.firestore().collection("announcements").doc(id).delete();
    }
}

// ====================
// SEND PUSH NOTIFICATION
// ====================
function sendPushNotification(title) {
    fetch("http://127.0.0.1:5001/pecheyo-31a54/us-central1/sendNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: "FAKE_FCM_TOKEN",  // Replace with real device token
            title: title,
            body: "New Pecheyo Church announcement posted"
        })
    })
        .then(response => response.text())
        .then(result => console.log("Notification result:", result))
        .catch(err => console.error("Notification error:", err));
}

// ====================
// REAL-TIME INDEX PAGE DISPLAY
// ====================
const latestAnnouncementDiv = document.getElementById("latestAnnouncement");
const allAnnouncementsDiv = document.getElementById("allAnnouncements");

if (latestAnnouncementDiv || allAnnouncementsDiv) {
    firebase.firestore().collection("announcements")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            let first = true;
            if (latestAnnouncementDiv) latestAnnouncementDiv.innerHTML = "";
            if (allAnnouncementsDiv) allAnnouncementsDiv.innerHTML = "";

            snapshot.forEach(doc => {
                const a = doc.data();
                const card = `
                    <div class="announcement-box">
                        <h3>${a.title}</h3>
                        <p>${a.message}</p>
                        <small>${a.timestamp ? a.timestamp.toDate().toLocaleString() : "Just now"}</small>
                    </div>
                `;

                if (first && latestAnnouncementDiv) {
                    latestAnnouncementDiv.innerHTML = card;
                    first = false;
                }

                if (allAnnouncementsDiv) allAnnouncementsDiv.innerHTML += card;
            });
        });
}
