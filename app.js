import {
  db,
  firebaseReady,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "./firebase.js";

const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const themeToggle = document.getElementById("themeToggle");

const currentUserDisplay = document.getElementById("currentUserDisplay");
const heroUserName = document.getElementById("heroUserName");

const portalName = document.getElementById("portalName");
const portalEmail = document.getElementById("portalEmail");
const portalRole = document.getElementById("portalRole");

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

const bookingForm = document.getElementById("bookingForm");
const confirmationMessage = document.getElementById("confirmationMessage");
const firebaseStatus = document.getElementById("firebaseStatus");

const recentAppointments = document.getElementById("recentAppointments");
const portalAppointments = document.getElementById("portalAppointments");
const statAppointments = document.getElementById("statAppointments");
const statToday = document.getElementById("statToday");

const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

let appointments = [];
let currentDate = new Date();

function saveThemePreference(isDark) {
  localStorage.setItem("medischedule_theme", isDark ? "dark" : "light");
}

function loadThemePreference() {
  const theme = localStorage.getItem("medischedule_theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  saveThemePreference(document.body.classList.contains("dark-mode"));
});

function saveUser(user) {
  localStorage.setItem("medischedule_user", JSON.stringify(user));
}

function getUser() {
  const saved = localStorage.getItem("medischedule_user");
  return saved ? JSON.parse(saved) : null;
}

function clearUser() {
  localStorage.removeItem("medischedule_user");
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active-section");
  });

  navButtons.forEach((button) => {
    button.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active-section");
  document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

function renderUser(user) {
  currentUserDisplay.textContent = `${user.name} · ${user.role}`;
  heroUserName.textContent = user.name;
  portalName.textContent = user.name;
  portalEmail.textContent = user.email;
  portalRole.textContent = user.role;

  document.getElementById("patientName").value = user.name;
  document.getElementById("patientEmail").value = user.email;
}

function enterApp(user) {
  loginScreen.classList.add("hidden");
  appContent.classList.remove("hidden");
  renderUser(user);
  renderDashboard();
  renderPortal();
  renderCalendar();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const user = {
    name: document.getElementById("loginName").value.trim(),
    email: document.getElementById("loginEmail").value.trim(),
    role: document.getElementById("loginRole").value
  };

  saveUser(user);
  enterApp(user);
});

logoutBtn.addEventListener("click", () => {
  clearUser();
  location.reload();
});

function formatAppointmentHTML(appt) {
  return `
    <div class="appointment-card">
      <h4>${appt.type}</h4>
      <div class="appointment-meta">
        <strong>Patient:</strong> ${appt.patientName}<br>
        <strong>Doctor:</strong> ${appt.doctor}<br>
        <strong>Date:</strong> ${appt.date}<br>
        <strong>Time:</strong> ${appt.time}<br>
        <strong>Email:</strong> ${appt.patientEmail}
      </div>
    </div>
  `;
}

function renderDashboard() {
  statAppointments.textContent = appointments.length.toString();

  const todayISO = new Date().toISOString().split("T")[0];
  const todayCount = appointments.filter((appt) => appt.date === todayISO).length;
  statToday.textContent = todayCount.toString();

  if (!appointments.length) {
    recentAppointments.innerHTML = `<div class="empty-state">No appointments yet.</div>`;
    return;
  }

  recentAppointments.innerHTML = appointments
    .slice(0, 5)
    .map(formatAppointmentHTML)
    .join("");
}

function renderPortal() {
  const user = getUser();

  if (!user) return;

  const userAppointments = appointments.filter(
    (appt) => appt.patientEmail.toLowerCase() === user.email.toLowerCase()
  );

  if (!userAppointments.length) {
    portalAppointments.innerHTML = `<div class="empty-state">No upcoming visits yet.</div>`;
    return;
  }

  portalAppointments.innerHTML = userAppointments.map(formatAppointmentHTML).join("");
}

function getAppointmentsForDay(year, month, day) {
  const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return appointments.filter((appt) => appt.date === dateString);
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  calendarMonthLabel.textContent = monthName;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < startDay; i++) {
    const prevDate = daysInPrevMonth - startDay + i + 1;
    const cell = document.createElement("div");
    cell.className = "calendar-day other-month";
    cell.innerHTML = `<div class="calendar-date">${prevDate}</div>`;
    calendarGrid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayAppointments = getAppointmentsForDay(year, month, day);
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    let pills = "";
    dayAppointments.slice(0, 2).forEach((appt) => {
      pills += `<span class="calendar-pill">${appt.time}</span>`;
    });

    if (dayAppointments.length > 2) {
      pills += `<span class="calendar-pill">+${dayAppointments.length - 2} more</span>`;
    }

    cell.innerHTML = `
      <div class="calendar-date">${day}</div>
      ${pills}
    `;

    calendarGrid.appendChild(cell);
  }

  const totalCells = startDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let i = 1; i <= remainingCells; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day other-month";
    cell.innerHTML = `<div class="calendar-date">${i}</div>`;
    calendarGrid.appendChild(cell);
  }
}

prevMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

async function loadAppointments() {
  if (firebaseReady && db) {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      firebaseStatus.textContent = "Firebase is connected and appointments are being loaded from Firestore.";
    } catch (error) {
      console.error("Error loading appointments:", error);
      appointments = JSON.parse(localStorage.getItem("medischedule_appointments") || "[]");
      firebaseStatus.textContent = "Firebase could not be loaded, so local saved appointments are being used instead.";
    }
  } else {
    appointments = JSON.parse(localStorage.getItem("medischedule_appointments") || "[]");
    firebaseStatus.textContent = "Firebase is not connected yet. Appointments are being stored locally in the browser.";
  }

  renderDashboard();
  renderPortal();
  renderCalendar();
}

function saveAppointmentsLocally() {
  localStorage.setItem("medischedule_appointments", JSON.stringify(appointments));
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const appointment = {
    patientName: document.getElementById("patientName").value.trim(),
    patientEmail: document.getElementById("patientEmail").value.trim(),
    doctor: document.getElementById("doctor").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    type: document.getElementById("type").value,
    notes: document.getElementById("notes").value.trim()
  };

  confirmationMessage.innerHTML = `
    <strong>Appointment Submitted</strong><br><br>
    <strong>Patient:</strong> ${appointment.patientName}<br>
    <strong>Email:</strong> ${appointment.patientEmail}<br>
    <strong>Doctor:</strong> ${appointment.doctor}<br>
    <strong>Date:</strong> ${appointment.date}<br>
    <strong>Time:</strong> ${appointment.time}<br>
    <strong>Type:</strong> ${appointment.type}<br>
    <strong>Notes:</strong> ${appointment.notes || "None"}
  `;

  if (firebaseReady && db) {
    try {
      await addDoc(collection(db, "appointments"), {
        ...appointment,
        createdAt: serverTimestamp()
      });
      await loadAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
      appointments.unshift(appointment);
      saveAppointmentsLocally();
      renderDashboard();
      renderPortal();
      renderCalendar();
    }
  } else {
    appointments.unshift(appointment);
    saveAppointmentsLocally();
    renderDashboard();
    renderPortal();
    renderCalendar();
  }

  bookingForm.reset();

  const user = getUser();
  if (user) {
    document.getElementById("patientName").value = user.name;
    document.getElementById("patientEmail").value = user.email;
  }
});

loadThemePreference();

const savedUser = getUser();
if (savedUser) {
  enterApp(savedUser);
}

loadAppointments();
