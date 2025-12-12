// ====================
// REAL-TIME — LATEST ANNOUNCEMENT
// ====================
const latestAnnouncementDiv = document.getElementById("latestAnnouncement");
const allAnnouncementsDiv = document.getElementById("allAnnouncements");

function renderAnnouncements() {
    db.collection("announcements")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            if (latestAnnouncementDiv) latestAnnouncementDiv.innerHTML = "";
            if (allAnnouncementsDiv) allAnnouncementsDiv.innerHTML = "";

            let first = true;
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

renderAnnouncements();

// ====================
// SECRETARY LOGIN
// ====================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMsg = document.getElementById("errorMsg");

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = "announcements.html";
            })
            .catch(error => {
                if (errorMsg) errorMsg.textContent = error.message;
                else alert(error.message);
            });
    });
}

// ====================
// SECRETARY LOGOUT
// ====================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        firebase.auth().signOut()
            .then(() => window.location.href = "login.html");
    });
}

// ====================
// PROTECT ANNOUNCEMENTS PAGE
// ====================
if (window.location.pathname.includes("announcements.html")) {
    firebase.auth().onAuthStateChanged(user => {
        if (!user || user.email !== "secretary@pecheyo.com") {
            window.location.href = "login.html"; // Redirect if not logged in or not secretary
        }
    });
}

// ====================
// POST ANNOUNCEMENT (SECRETARY)
// ====================
const announcementForm = document.getElementById("announcementForm");

if (announcementForm) {
    announcementForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value;
        const message = document.getElementById("message").value;

        try {
            await db.collection("announcements").add({
                title,
                message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toLocaleString()
            });
            alert("Announcement posted!");
            announcementForm.reset();
        } catch (err) {
            console.error("Error posting announcement:", err);
        }
    });
}
