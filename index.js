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
                        <small>${a.timestamp ? a.timestamp.toDate().toLocaleString() : a.date || "Just now"}</small>
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
            .then(() => window.location.href = "login.html")
            .catch(err => console.error("Logout error:", err));
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
        const title = document.getElementById("title").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!title || !message) {
            alert("Both title and message are required.");
            return;
        }

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

// ====================
// REAL-TIME CONTACT MESSAGES
// ====================
const contactForm = document.getElementById("contact-form");
const contactMessageDiv = document.getElementById("contactMessages"); // Optional: dashboard div

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = contactForm.user_name.value.trim();
        const email = contactForm.user_email.value.trim();
        const message = contactForm.message.value.trim();

        if (!name || !email || !message) {
            alert("All fields are required.");
            return;
        }

        try {
            await db.collection("contactMessages").add({
                name,
                email,
                message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toLocaleString()
            });

            alert("Message sent successfully!");
            contactForm.reset();

        } catch (err) {
            console.error("Error sending contact message:", err);
        }
    });
}

// Optional: Render contact messages live in a dashboard
if (contactMessageDiv) {
    db.collection("contactMessages")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            contactMessageDiv.innerHTML = "";
            snapshot.forEach(doc => {
                const c = doc.data();
                const card = `
                    <div class="contact-box">
                        <h4>${c.name} (${c.email})</h4>
                        <p>${c.message}</p>
                        <small>${c.timestamp ? c.timestamp.toDate().toLocaleString() : c.date || "Just now"}</small>
                    </div>
                `;
                contactMessageDiv.innerHTML += card;
            });
        });
}
