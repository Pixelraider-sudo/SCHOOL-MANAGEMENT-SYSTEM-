// =============================================
// STUDENT PORTAL - REGISTRATION & LOGIN SYSTEM
// =============================================

// Storage for registered students
let registeredStudents = JSON.parse(localStorage.getItem("students")) || [];

// DOM Elements
const registrationSection = document.getElementById("registration-section");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const registrationForm = document.getElementById("student-registration-form");
const loginForm = document.getElementById("student-login-form");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const switchToLogin = document.getElementById("switch-to-login");
const switchToRegister = document.getElementById("switch-to-register");
const deleteModal = document.getElementById("delete-modal");
const modalClose = document.querySelector(".modal-close");
const cancelDelete = document.querySelector(".btn-cancel");
const confirmDelete = document.getElementById("confirm-delete");

// Current logged in user
let currentUser = null;

// =============================================
// HELPER FUNCTIONS
// =============================================

function setCurrentDate() {
  const dateElement = document.getElementById("current-date");
  if (dateElement) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateElement.textContent = new Date().toLocaleDateString("en-US", options);
  }
}

function updateDashboard() {
  if (!currentUser) return;

  document.getElementById("student-name").textContent = currentUser.fullname;
  document.getElementById("student-class").textContent = currentUser.class;
  document.getElementById("student-adm").textContent =
    `ADM: ${currentUser.admission}`;
  document.getElementById("welcome-name").textContent =
    currentUser.fullname.split(" ")[0];

  const avatarImg = document.getElementById("student-avatar");
  avatarImg.src = `https://ui-avatars.com/api/?background=2c5f2d&color=fff&name=${currentUser.fullname.replace(" ", "+")}`;

  document.getElementById("profile-name").value = currentUser.fullname;
  document.getElementById("profile-email").value = currentUser.email;
  document.getElementById("profile-phone").value = currentUser.phone;
}

function showDashboard() {
  registrationSection.classList.add("hidden");
  loginSection.classList.add("hidden");
  dashboardSection.classList.add("active");
  setCurrentDate();
  updateDashboard();
}

function showRegistration() {
  registrationSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("active");
}

function showLogin() {
  registrationSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
  dashboardSection.classList.remove("active");
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem("currentStudent", JSON.stringify(currentUser));
  }
}

function loadSession() {
  const savedUser = localStorage.getItem("currentStudent");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
    return true;
  }
  return false;
}

function clearSession() {
  localStorage.removeItem("currentStudent");
  currentUser = null;
  showLogin();
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
        <span>${message}</span>
    `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =============================================
// REGISTRATION
// =============================================

registrationForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const fullname = document.getElementById("reg-fullname").value.trim();
  const admission = document
    .getElementById("reg-admission")
    .value.trim()
    .toUpperCase();
  const studentClass = document.getElementById("reg-class").value;
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-confirm-password").value;

  // Validation
  if (
    !fullname ||
    !admission ||
    !studentClass ||
    !email ||
    !phone ||
    !password
  ) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match!", "error");
    return;
  }

  if (password.length < 4) {
    showToast("Password must be at least 4 characters", "error");
    return;
  }

  // Check if admission number already exists
  if (registeredStudents.some((s) => s.admission === admission)) {
    showToast("Admission number already registered!", "error");
    return;
  }

  // Create new student
  const newStudent = {
    id: Date.now(),
    fullname,
    admission,
    class: studentClass,
    email,
    phone,
    password,
    createdAt: new Date().toISOString(),
  };

  registeredStudents.push(newStudent);
  localStorage.setItem("students", JSON.stringify(registeredStudents));

  currentUser = newStudent;
  saveSession();
  showDashboard();
  showToast("Account created successfully! Welcome to Cheptalal!", "success");

  registrationForm.reset();
});

// =============================================
// LOGIN
// =============================================

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const admission = document
    .getElementById("login-admission")
    .value.trim()
    .toUpperCase();
  const password = document.getElementById("login-password").value;

  const student = registeredStudents.find(
    (s) => s.admission === admission && s.password === password,
  );

  if (student) {
    currentUser = student;
    saveSession();
    showDashboard();
    showToast(`Welcome back, ${student.fullname.split(" ")[0]}!`, "success");
    loginForm.reset();
  } else {
    showToast("Invalid Admission Number or Password", "error");

    const card = document.querySelector("#login-section .registration-card");
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 500);
  }
});

// =============================================
// LOGOUT
// =============================================

logoutBtn.addEventListener("click", () => {
  clearSession();
  showToast("Logged out successfully!", "info");
});

// =============================================
// SWITCH BETWEEN REGISTRATION & LOGIN
// =============================================

switchToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});

switchToRegister.addEventListener("click", (e) => {
  e.preventDefault();
  showRegistration();
});

// =============================================
// ACCOUNT DELETION
// =============================================

deleteAccountBtn.addEventListener("click", () => {
  if (deleteModal) deleteModal.classList.add("active");
});

function closeModal() {
  if (deleteModal) deleteModal.classList.remove("active");
}

if (modalClose) modalClose.addEventListener("click", closeModal);
if (cancelDelete) cancelDelete.addEventListener("click", closeModal);

if (confirmDelete) {
  confirmDelete.addEventListener("click", () => {
    if (currentUser) {
      const index = registeredStudents.findIndex(
        (s) => s.id === currentUser.id,
      );
      if (index !== -1) {
        registeredStudents.splice(index, 1);
        localStorage.setItem("students", JSON.stringify(registeredStudents));
      }
      clearSession();
      closeModal();
      showToast("Account deleted successfully!", "warning");
    }
  });
}

// =============================================
// PROFILE UPDATE
// =============================================

const saveProfileBtn = document.querySelector(".btn-save-profile");
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
    if (currentUser) {
      currentUser.fullname = document.getElementById("profile-name").value;
      currentUser.email = document.getElementById("profile-email").value;
      currentUser.phone = document.getElementById("profile-phone").value;

      const index = registeredStudents.findIndex(
        (s) => s.id === currentUser.id,
      );
      if (index !== -1) {
        registeredStudents[index] = currentUser;
        localStorage.setItem("students", JSON.stringify(registeredStudents));
      }

      saveSession();
      updateDashboard();
      showToast("Profile updated successfully!", "success");
    }
  });
}

// =============================================
// NAVIGATION
// =============================================

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

function showPage(pageId) {
  pages.forEach((page) => page.classList.remove("active"));
  const activePage = document.getElementById(`${pageId}-page`);
  if (activePage) activePage.classList.add("active");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-page") === pageId) link.classList.add("active");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const pageId = link.getAttribute("data-page");
    if (pageId) showPage(pageId);
  });
});

// =============================================
// ASSIGNMENT BUTTONS
// =============================================

document
  .querySelectorAll(".btn-submit, .btn-download, .btn-view-feedback")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("btn-submit")) {
        showToast("Assignment submission feature coming soon!", "info");
      } else if (btn.classList.contains("btn-download")) {
        showToast("Download started! (Demo)", "success");
      } else if (btn.classList.contains("btn-view-feedback")) {
        showToast("Feedback: Great work! Keep it up!", "info");
      }
    });
  });

document.querySelectorAll(".view-all").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("View all feature coming soon!", "info");
  });
});

// =============================================
// INITIALIZE
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  const sessionLoaded = loadSession();
  if (!sessionLoaded) {
    showRegistration();
  }

  window.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeModal();
  });
});

// Add shake animation CSS
const style = document.createElement("style");
style.textContent = `
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .toast {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: white;
        padding: 15px 25px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .toast.show { transform: translateX(0); }
    .toast-success { border-left: 4px solid #10b981; }
    .toast-success i { color: #10b981; }
    .toast-error { border-left: 4px solid #ef4444; }
    .toast-error i { color: #ef4444; }
    .toast-info { border-left: 4px solid #3b82f6; }
    .toast-info i { color: #3b82f6; }
    .toast-warning { border-left: 4px solid #f59e0b; }
    .toast-warning i { color: #f59e0b; }
    
    @media (max-width: 768px) {
        .toast {
            bottom: 20px;
            right: 20px;
            left: 20px;
            transform: translateY(100px);
        }
        .toast.show { transform: translateY(0); }
    }
`;
document.head.appendChild(style);
