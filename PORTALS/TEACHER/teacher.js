// =============================================
// TEACHER PORTAL - COMPLETE FUNCTIONALITY
// =============================================

// Storage Keys
const STORAGE_KEYS = {
  TEACHERS: "teachers",
  CLASSES: "teacherClasses",
  ASSIGNMENTS: "assignments",
  ANNOUNCEMENTS: "announcements",
  ATTENDANCE: "attendanceRecords",
  GRADES: "gradesRecords",
  MATERIALS: "learningMaterials",
  TIMETABLES: "timetables",
  CURRENT_TEACHER: "currentTeacher",
  STUDENTS: "students",
};

// Initialize storage arrays
let registeredTeachers =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS)) || [];
let classes = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES)) || [];
let assignments =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) || [];
let announcements =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
let attendanceRecords =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || [];
let gradesRecords = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES)) || [];
let learningMaterials =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS)) || [];
let timetables =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMETABLES)) || [];
let registeredStudents =
  JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];

let currentTeacher = null;

// DOM Elements
const registrationSection = document.getElementById("registration-section");
const loginSection = document.getElementById("login-section");
const portalContainer = document.getElementById("portal-container");
const registrationForm = document.getElementById("teacher-registration-form");
const loginForm = document.getElementById("teacher-login-form");
const logoutBtn = document.getElementById("logoutBtn");
const switchToLogin = document.getElementById("switch-to-login");
const switchToRegister = document.getElementById("switch-to-register");

// =============================================
// HELPER FUNCTIONS
// =============================================

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function updateDashboard() {
  if (!currentTeacher) return;

  document.getElementById("teacher-name").textContent = currentTeacher.fullname;
  document.getElementById("teacher-role").textContent =
    `${currentTeacher.subject} | ${currentTeacher.role}`;
  document.getElementById("dashboard-welcome").textContent =
    `Welcome back, ${currentTeacher.fullname.split(" ")[0]}!`;
  document.getElementById("teacher-avatar").src =
    `https://ui-avatars.com/api/?background=2c5f2d&color=fff&name=${currentTeacher.fullname.replace(" ", "+")}`;

  const teacherClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id,
  );
  const totalStudents = teacherClasses.reduce(
    (sum, c) => sum + (c.students || 0),
    0,
  );
  document.getElementById("total-students").textContent = totalStudents;
  document.getElementById("active-classes").textContent = teacherClasses.length;
  document.getElementById("pending-tasks").textContent = assignments.filter(
    (a) => a.teacherId === currentTeacher.id && !a.completed,
  ).length;

  const today = new Date().toISOString().split("T")[0];
  let totalPresent = 0;
  let totalStudentsCount = 0;
  teacherClasses.forEach((cls) => {
    const record = attendanceRecords.find(
      (r) => r.classId === cls.id && r.date === today,
    );
    if (record && record.students) {
      totalPresent += record.students.filter(
        (s) => s.status === "present",
      ).length;
      totalStudentsCount += record.students.length;
    }
  });
  const attendanceRate =
    totalStudentsCount > 0
      ? Math.round((totalPresent / totalStudentsCount) * 100)
      : "--";
  document.getElementById("attendance-today").textContent =
    attendanceRate === "--" ? "--%" : `${attendanceRate}%`;
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  localStorage.setItem(
    STORAGE_KEYS.ANNOUNCEMENTS,
    JSON.stringify(announcements),
  );
  localStorage.setItem(
    STORAGE_KEYS.ATTENDANCE,
    JSON.stringify(attendanceRecords),
  );
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(gradesRecords));
  localStorage.setItem(
    STORAGE_KEYS.MATERIALS,
    JSON.stringify(learningMaterials),
  );
  localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(timetables));
  localStorage.setItem(
    STORAGE_KEYS.STUDENTS,
    JSON.stringify(registeredStudents),
  );
}

function closeModals() {
  document
    .querySelectorAll(".modal")
    .forEach((modal) => modal.classList.add("hidden"));
}

// =============================================
// CLASSES MANAGEMENT
// =============================================

function loadClasses() {
  const teacherClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("classes-container");
  if (!container) return;

  if (teacherClasses.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No classes assigned yet. Click "Add New Class" to create one.</p></div>';
    return;
  }

  container.innerHTML = teacherClasses
    .map(
      (cls) => `
        <div class="class-card">
            <div class="class-header">
                <div class="class-grade">${cls.name}</div>
                <div class="class-students">${cls.students || 0} Students</div>
            </div>
            <div class="class-body">
                <h3>${currentTeacher.subject}</h3>
                <p>${cls.description || "Regular class sessions"}</p>
                <div class="class-stats">
                    <div class="stat"><span>Avg. Score</span><strong>${cls.avgScore || "--"}%</strong></div>
                    <div class="stat"><span>Attendance</span><strong>${cls.attendance || "--"}%</strong></div>
                    <div class="stat"><span>Assignments</span><strong>${cls.assignmentsSubmitted || 0}/${cls.totalAssignments || 0}</strong></div>
                </div>
            </div>
            <div class="class-footer">
                <button class="btn-view" onclick="viewClass('${cls.id}')">View Class</button>
                <button class="btn-message" onclick="messageClass('${cls.id}')">Message</button>
            </div>
        </div>
    `,
    )
    .join("");
}

document.getElementById("add-class-btn")?.addEventListener("click", () => {
  document.getElementById("add-class-modal").classList.remove("hidden");
});

document.getElementById("save-new-class")?.addEventListener("click", () => {
  const name = document.getElementById("new-class-name").value;
  const students =
    parseInt(document.getElementById("new-class-students").value) || 0;
  const description = document.getElementById("new-class-description").value;

  if (name) {
    const newClass = {
      id: Date.now(),
      name,
      students,
      description,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullname,
      createdAt: new Date().toISOString(),
    };
    classes.push(newClass);
    saveToLocalStorage();
    loadClasses();
    updateDashboard();
    closeModals();
    document.getElementById("new-class-name").value = "";
    document.getElementById("new-class-students").value = "";
    document.getElementById("new-class-description").value = "";
    showToast(`Class ${name} added successfully!`, "success");
  } else {
    showToast("Please enter class name", "error");
  }
});

// =============================================
// ATTENDANCE MANAGEMENT (same as before, but with student sync)
// =============================================

function loadAttendance() {
  const teacherClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("attendance-container");
  if (!container) return;

  container.innerHTML = `
        <div class="attendance-controls">
            <div class="date-selector">
                <input type="date" id="attendance-date" value="${new Date().toISOString().split("T")[0]}">
                <select id="attendance-class-select" class="class-select">
                    <option value="">Select Class</option>
                    ${teacherClasses.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
                </select>
                <button class="btn-primary" id="load-attendance-btn"><i class="fas fa-search"></i> Load Class</button>
            </div>
        </div>
        <div id="attendance-table-container"></div>
        <div id="attendance-summary"></div>
    `;

  document
    .getElementById("load-attendance-btn")
    ?.addEventListener("click", loadAttendanceTable);
}

function loadAttendanceTable() {
  const classId = document.getElementById("attendance-class-select").value;
  const date = document.getElementById("attendance-date").value;
  const selectedClass = classes.find((c) => c.id === classId);

  if (!selectedClass) return;

  const students = registeredStudents.filter(
    (s) => s.class === selectedClass.name,
  );

  if (students.length === 0) {
    // Sample students for demo
    const sampleStudents = [
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-001`,
        name: "John Mwangi",
        adm: "CHP-001",
        class: selectedClass.name,
      },
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-002`,
        name: "Jane Wanjiku",
        adm: "CHP-002",
        class: selectedClass.name,
      },
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-003`,
        name: "Michael Ochieng",
        adm: "CHP-003",
        class: selectedClass.name,
      },
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-004`,
        name: "Mary Akinyi",
        adm: "CHP-004",
        class: selectedClass.name,
      },
    ];
    sampleStudents.forEach((s) => {
      if (!registeredStudents.find((rs) => rs.adm === s.adm)) {
        registeredStudents.push(s);
      }
    });
    saveToLocalStorage();
  }

  const classStudents = registeredStudents.filter(
    (s) => s.class === selectedClass.name,
  );
  const existingRecord = attendanceRecords.find(
    (r) => r.classId === classId && r.date === date,
  );

  const tableHtml = `
        <div class="attendance-table-container">
            <table class="attendance-table">
                <thead> <th>Student Name</th><th>Admission No.</th><th>Status</th><th>Remarks</th> </thead>
                <tbody>
                    ${classStudents
                      .map((student) => {
                        const record = existingRecord?.students?.find(
                          (s) => s.id === student.id,
                        );
                        return `
                            <tr>
                                <td><div class="student-info"><img src="https://ui-avatars.com/api/?background=ffb703&color=fff&name=${student.name.split(" ")[0]}" alt="Student"><span>${student.name}</span></div></td>
                                <td>${student.adm}</td>
                                <td><select class="status-select" data-student-id="${student.id}">
                                    <option value="present" ${record?.status === "present" ? "selected" : ""}>✓ Present</option>
                                    <option value="absent" ${record?.status === "absent" ? "selected" : ""}>✗ Absent</option>
                                    <option value="late" ${record?.status === "late" ? "selected" : ""}>⏰ Late</option>
                                    <option value="excused" ${record?.status === "excused" ? "selected" : ""}>📝 Excused</option>
                                </select></td>
                                <td><input type="text" placeholder="Add remarks..." class="remarks-input" value="${record?.remarks || ""}" data-student-id="${student.id}"></td>
                            </tr>
                        `;
                      })
                      .join("")}
                </tbody>
            </table>
        </div>
        <div class="attendance-summary">
            <div class="summary-card"><h4>Today's Summary</h4><div class="summary-stats" id="attendance-summary-stats"></div></div>
            <button class="btn-save-attendance" id="save-attendance-btn"><i class="fas fa-save"></i> Save Attendance</button>
        </div>
    `;

  document.getElementById("attendance-table-container").innerHTML = tableHtml;
  document
    .getElementById("save-attendance-btn")
    ?.addEventListener("click", () => saveAttendance(classId, date));
  updateAttendanceSummary();
}

function updateAttendanceSummary() {
  const selects = document.querySelectorAll(".status-select");
  let present = 0,
    absent = 0,
    late = 0,
    excused = 0;
  selects.forEach((select) => {
    const value = select.value;
    if (value === "present") present++;
    else if (value === "absent") absent++;
    else if (value === "late") late++;
    else if (value === "excused") excused++;
  });
  const summaryDiv = document.getElementById("attendance-summary-stats");
  if (summaryDiv) {
    summaryDiv.innerHTML = `
            <div class="summary-stat"><span>Present</span><strong>${present}</strong></div>
            <div class="summary-stat"><span>Absent</span><strong>${absent}</strong></div>
            <div class="summary-stat"><span>Late</span><strong>${late}</strong></div>
            <div class="summary-stat"><span>Excused</span><strong>${excused}</strong></div>
        `;
  }
}

function saveAttendance(classId, date) {
  const students = [];
  const selects = document.querySelectorAll(".status-select");
  const remarks = document.querySelectorAll(".remarks-input");

  selects.forEach((select, index) => {
    students.push({
      id: select.dataset.studentId,
      status: select.value,
      remarks: remarks[index]?.value || "",
    });
  });

  const existingIndex = attendanceRecords.findIndex(
    (r) => r.classId === classId && r.date === date,
  );
  const record = {
    classId,
    date,
    students,
    teacherId: currentTeacher.id,
    teacherName: currentTeacher.fullname,
  };

  if (existingIndex !== -1) {
    attendanceRecords[existingIndex] = record;
  } else {
    attendanceRecords.push(record);
  }

  saveToLocalStorage();
  showToast(
    "Attendance saved successfully! Students can now view it.",
    "success",
  );
}

// =============================================
// ASSIGNMENTS MANAGEMENT
// =============================================

function loadAssignments() {
  const teacherAssignments = assignments.filter(
    (a) => a.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("assignments-container");
  if (!container) return;

  if (teacherAssignments.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-tasks"></i><p>No assignments created yet. Click "Create Assignment" to get started.</p></div>';
    return;
  }

  container.innerHTML = teacherAssignments
    .map(
      (assign) => `
        <div class="assignment-card">
            <div class="assignment-header">
                <h3>${assign.title}</h3>
                <span class="deadline">Due: ${assign.dueDate}</span>
            </div>
            <div class="assignment-body">
                <p><strong>Class: ${assign.className}</strong></p>
                <p>${assign.description}</p>
                <div class="attachment"><i class="fas fa-paperclip"></i><span>Submissions: ${assign.submissions || 0}/${assign.totalStudents || 0}</span></div>
            </div>
            <div class="assignment-footer">
                <button class="btn-view" onclick="viewSubmissions('${assign.id}')">View Submissions</button>
                <button class="btn-delete" onclick="deleteAssignment('${assign.id}')">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function deleteAssignment(assignmentId) {
  if (
    confirm(
      "Are you sure you want to delete this assignment? Students will no longer see it.",
    )
  ) {
    assignments = assignments.filter((a) => a.id !== assignmentId);
    saveToLocalStorage();
    loadAssignments();
    showToast("Assignment deleted successfully!", "success");
  }
}

document.getElementById("new-assignment-btn")?.addEventListener("click", () => {
  document.getElementById("assignment-modal").classList.remove("hidden");
});

document.getElementById("save-assignment")?.addEventListener("click", () => {
  const className = document.getElementById("assignment-class").value;
  const title = document.getElementById("assignment-title").value;
  const description = document.getElementById("assignment-description").value;
  const dueDate = document.getElementById("assignment-due-date").value;

  if (title && description && dueDate && className) {
    assignments.push({
      id: Date.now(),
      title,
      description,
      dueDate,
      className,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullname,
      subject: currentTeacher.subject,
      submissions: 0,
      totalStudents:
        registeredStudents.filter((s) => s.class === className).length || 40,
      createdAt: new Date().toISOString(),
    });
    saveToLocalStorage();
    loadAssignments();
    closeModals();
    document.getElementById("assignment-title").value = "";
    document.getElementById("assignment-description").value = "";
    document.getElementById("assignment-due-date").value = "";
    showToast(
      "Assignment created successfully! Students can now view it.",
      "success",
    );
  } else {
    showToast("Please fill all fields", "error");
  }
});

// =============================================
// ANNOUNCEMENTS MANAGEMENT
// =============================================

function loadAnnouncements() {
  const teacherAnnouncements = announcements.filter(
    (a) => a.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("announcements-list");
  if (!container) return;

  if (teacherAnnouncements.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-bell"></i><p>No announcements yet. Click "Send Announcement" to notify students.</p></div>';
    return;
  }

  container.innerHTML = teacherAnnouncements
    .map(
      (ann) => `
        <div class="announcement-card">
            <div class="announcement-header">
                <i class="fas fa-bullhorn"></i>
                <h4>${ann.title}</h4>
                <span>${ann.date}</span>
            </div>
            <div class="announcement-body">
                <p><strong>To: ${ann.targetClass === "all" ? "All Classes" : ann.targetClass}</strong></p>
                <p>${ann.message}</p>
                <button class="btn-delete" onclick="deleteAnnouncement('${ann.id}')" style="margin-top: 10px; padding: 5px 12px;">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function deleteAnnouncement(announcementId) {
  if (confirm("Delete this announcement? Students will no longer see it.")) {
    announcements = announcements.filter((a) => a.id !== announcementId);
    saveToLocalStorage();
    loadAnnouncements();
    showToast("Announcement deleted!", "success");
  }
}

document
  .getElementById("send-announcement-btn")
  ?.addEventListener("click", () => {
    document.getElementById("announcement-modal").classList.remove("hidden");
  });

document.getElementById("send-announcement")?.addEventListener("click", () => {
  const targetClass = document.getElementById("announcement-class").value;
  const title = document.getElementById("announcement-title").value;
  const message = document.getElementById("announcement-message").value;

  if (title && message) {
    announcements.push({
      id: Date.now(),
      title,
      message,
      targetClass,
      date: new Date().toLocaleDateString(),
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullname,
    });
    saveToLocalStorage();
    loadAnnouncements();
    closeModals();
    document.getElementById("announcement-title").value = "";
    document.getElementById("announcement-message").value = "";
    showToast(
      "Announcement sent successfully! Students can now view it.",
      "success",
    );
  } else {
    showToast("Please fill all fields", "error");
  }
});

// =============================================
// LEARNING MATERIALS MANAGEMENT (with modal)
// =============================================

function loadLearningMaterials() {
  const teacherMaterials = learningMaterials.filter(
    (m) => m.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("materials-container");
  if (!container) return;

  if (teacherMaterials.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No materials uploaded yet. Click "Upload Material" to share resources.</p></div>';
    return;
  }

  container.innerHTML = teacherMaterials
    .map(
      (material) => `
        <div class="material-card">
            <div class="material-icon"><i class="fas ${material.type === "pdf" ? "fa-file-pdf" : material.type === "video" ? "fa-video" : "fa-file-alt"}"></i></div>
            <div class="material-info">
                <h4>${material.title}</h4>
                <p>${material.description || "No description"}</p>
                <span>Uploaded: ${material.date} | For: ${material.className} | File: ${material.fileName || "Document"}</span>
            </div>
            <div class="material-actions">
                <button class="btn-download" onclick="downloadMaterial('${material.id}')"><i class="fas fa-download"></i> Download</button>
                <button class="btn-delete" onclick="deleteMaterial('${material.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function deleteMaterial(materialId) {
  if (confirm("Delete this material? Students will no longer have access.")) {
    learningMaterials = learningMaterials.filter((m) => m.id !== materialId);
    saveToLocalStorage();
    loadLearningMaterials();
    showToast("Material deleted!", "success");
  }
}

function downloadMaterial(materialId) {
  const material = learningMaterials.find((m) => m.id === materialId);
  if (material) {
    showToast(`Downloading ${material.title}...`, "success");
  }
}

// Material Upload Modal
document
  .getElementById("upload-material-btn")
  ?.addEventListener("click", () => {
    document.getElementById("material-upload-modal").classList.remove("hidden");
  });

// File preview for material upload
const materialFileInput = document.getElementById("material-file");
const filePreview = document.getElementById("file-preview");

materialFileInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    filePreview.innerHTML = `<i class="fas fa-file"></i> ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    filePreview.classList.add("show");
  } else {
    filePreview.classList.remove("show");
  }
});

document.getElementById("save-material")?.addEventListener("click", () => {
  const title = document.getElementById("material-title").value;
  const className = document.getElementById("material-class").value;
  const type = document.getElementById("material-type").value;
  const description = document.getElementById("material-description").value;
  const file = document.getElementById("material-file").files[0];

  if (title && className) {
    learningMaterials.push({
      id: Date.now(),
      title,
      description: description || "No description provided",
      className,
      type,
      date: new Date().toLocaleDateString(),
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullname,
      fileName: file ? file.name : "No file attached",
      fileSize: file ? (file.size / 1024).toFixed(2) + " KB" : null,
    });
    saveToLocalStorage();
    loadLearningMaterials();
    closeModals();
    document.getElementById("material-title").value = "";
    document.getElementById("material-description").value = "";
    document.getElementById("material-file").value = "";
    filePreview.classList.remove("show");
    showToast(
      "Material uploaded successfully! Students can now view and download it.",
      "success",
    );
  } else {
    showToast("Please enter material title", "error");
  }
});

// =============================================
// TIMETABLE MANAGEMENT (with modal)
// =============================================

function loadTimetable() {
  const teacherTimetables = timetables.filter(
    (t) => t.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("timetable-container");
  if (!container) return;

  if (teacherTimetables.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No timetables uploaded yet. Click "Upload Timetable" to share schedules.</p></div>';
    return;
  }

  container.innerHTML = teacherTimetables
    .map(
      (tt) => `
        <div class="timetable-card">
            <div class="timetable-header">
                <h4>${tt.title}</h4>
                <span>${tt.className} | ${tt.term || "Current Term"}</span>
            </div>
            <div class="timetable-preview">
                ${tt.description}
            </div>
            <div class="timetable-actions">
                <button class="btn-download" onclick="downloadTimetable('${tt.id}')"><i class="fas fa-download"></i> Download</button>
                <button class="btn-delete" onclick="deleteTimetable('${tt.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function deleteTimetable(timetableId) {
  if (confirm("Delete this timetable? Students will no longer see it.")) {
    timetables = timetables.filter((t) => t.id !== timetableId);
    saveToLocalStorage();
    loadTimetable();
    showToast("Timetable deleted!", "success");
  }
}

function downloadTimetable(timetableId) {
  showToast("Downloading timetable...", "success");
}

// Timetable Upload Modal
document
  .getElementById("upload-timetable-btn")
  ?.addEventListener("click", () => {
    document
      .getElementById("timetable-upload-modal")
      .classList.remove("hidden");
  });

// File preview for timetable upload
const timetableFileInput = document.getElementById("timetable-file");
const timetableFilePreview = document.getElementById("timetable-file-preview");

timetableFileInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    timetableFilePreview.innerHTML = `<i class="fas fa-file"></i> ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    timetableFilePreview.classList.add("show");
  } else {
    timetableFilePreview.classList.remove("show");
  }
});

document.getElementById("save-timetable")?.addEventListener("click", () => {
  const title = document.getElementById("timetable-title").value;
  const className = document.getElementById("timetable-class").value;
  const term = document.getElementById("timetable-term").value;
  const description = document.getElementById("timetable-description").value;

  if (title && className) {
    timetables.push({
      id: Date.now(),
      title,
      className,
      term: term || "Current Term",
      description: description || "Timetable details",
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullname,
      date: new Date().toLocaleDateString(),
    });
    saveToLocalStorage();
    loadTimetable();
    closeModals();
    document.getElementById("timetable-title").value = "";
    document.getElementById("timetable-term").value = "";
    document.getElementById("timetable-description").value = "";
    document.getElementById("timetable-file").value = "";
    timetableFilePreview.classList.remove("show");
    showToast(
      "Timetable uploaded successfully! Students can now view it.",
      "success",
    );
  } else {
    showToast("Please enter timetable title", "error");
  }
});

// =============================================
// GRADES & ASSESSMENT MANAGEMENT
// =============================================

function loadGrades() {
  const teacherClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("grades-container");
  if (!container) return;

  container.innerHTML = `
        <div class="grades-controls">
            <select id="grades-class-select" class="class-select">
                <option value="">Select Class</option>
                ${teacherClasses.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
            <select id="grades-assessment-select" class="assessment-select">
                <option>Term 1 - CAT 1</option>
                <option>Term 1 - Mid-term Exam</option>
                <option>Term 1 - CAT 2</option>
                <option>Term 1 - End-term Exam</option>
            </select>
            <button class="btn-primary" id="load-grades-btn"><i class="fas fa-search"></i> Load Students</button>
        </div>
        <div id="grades-table-container"></div>
        <button id="save-grades-btn" class="btn-save-grades" style="display: none;"><i class="fas fa-save"></i> Save Grades</button>
    `;

  document
    .getElementById("load-grades-btn")
    ?.addEventListener("click", loadGradesTable);
}

function loadGradesTable() {
  const classId = document.getElementById("grades-class-select").value;
  const assessment = document.getElementById("grades-assessment-select").value;
  const selectedClass = classes.find((c) => c.id === classId);

  if (!selectedClass) return;

  const classStudents = registeredStudents.filter(
    (s) => s.class === selectedClass.name,
  );

  if (classStudents.length === 0) {
    const sampleStudents = [
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-001`,
        name: "John Mwangi",
        adm: "CHP-001",
        class: selectedClass.name,
      },
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-002`,
        name: "Jane Wanjiku",
        adm: "CHP-002",
        class: selectedClass.name,
      },
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-003`,
        name: "Michael Ochieng",
        adm: "CHP-003",
        class: selectedClass.name,
      },
      {
        id: `STU-${selectedClass.name.replace(/\s/g, "")}-004`,
        name: "Mary Akinyi",
        adm: "CHP-004",
        class: selectedClass.name,
      },
    ];
    sampleStudents.forEach((s) => {
      if (!registeredStudents.find((rs) => rs.adm === s.adm)) {
        registeredStudents.push(s);
      }
    });
    saveToLocalStorage();
  }

  const students = registeredStudents.filter(
    (s) => s.class === selectedClass.name,
  );
  const existingGrades = gradesRecords.find(
    (g) => g.classId === classId && g.assessment === assessment,
  );

  const tableHtml = `
        <div class="grades-table-container">
            <table class="grades-table">
                <thead> <th>Student Name</th><th>Admission No.</th><th>Score</th><th>Grade</th><th>Remarks</th> </thead>
                <tbody>
                    ${students
                      .map((student) => {
                        const record = existingGrades?.students?.find(
                          (s) => s.id === student.id,
                        );
                        const score = record?.score || "";
                        const getGrade = (s) => {
                          if (s >= 80) return "A";
                          if (s >= 70) return "B+";
                          if (s >= 60) return "B";
                          if (s >= 50) return "C";
                          return "D";
                        };
                        const grade = score ? getGrade(score) : "--";
                        return `
                            <tr>
                                <td>${student.name} <br><small>${student.adm}</small></td>
                                <td><input type="number" class="score-input" data-student-id="${student.id}" value="${score}" min="0" max="100" style="width:80px"></td>
                                <td><span class="grade-badge ${grade === "--" ? "" : grade}">${grade}</span></td>
                                <td><input type="text" placeholder="Remarks..." class="remarks-input" value="${record?.remarks || ""}" data-student-id="${student.id}"></td>
                             </tr>
                        `;
                      })
                      .join("")}
                </tbody>
            </table>
        </div>
    `;

  document.getElementById("grades-table-container").innerHTML = tableHtml;
  document.getElementById("save-grades-btn").style.display = "block";

  document.querySelectorAll(".score-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const score = parseInt(e.target.value);
      const gradeSpan = e.target.closest("tr").querySelector(".grade-badge");
      if (score >= 80) gradeSpan.textContent = "A";
      else if (score >= 70) gradeSpan.textContent = "B+";
      else if (score >= 60) gradeSpan.textContent = "B";
      else if (score >= 50) gradeSpan.textContent = "C";
      else gradeSpan.textContent = "D";
    });
  });

  document.getElementById("save-grades-btn").onclick = () =>
    saveGrades(classId, assessment);
}

function saveGrades(classId, assessment) {
  const students = [];
  const inputs = document.querySelectorAll(".score-input");
  const remarks = document.querySelectorAll(".remarks-input");

  inputs.forEach((input, index) => {
    const score = parseInt(input.value);
    students.push({
      id: input.dataset.studentId,
      score: score || 0,
      remarks: remarks[index]?.value || "",
    });
  });

  const existingIndex = gradesRecords.findIndex(
    (g) => g.classId === classId && g.assessment === assessment,
  );
  const record = {
    classId,
    assessment,
    students,
    teacherId: currentTeacher.id,
    teacherName: currentTeacher.fullname,
    date: new Date().toLocaleDateString(),
  };

  if (existingIndex !== -1) {
    gradesRecords[existingIndex] = record;
  } else {
    gradesRecords.push(record);
  }

  saveToLocalStorage();
  showToast(
    "Grades saved successfully! Students can now view their results.",
    "success",
  );
}

// New Assessment
document.getElementById("new-assessment-btn")?.addEventListener("click", () => {
  const teacherClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id,
  );
  const select = document.getElementById("assessment-class-select");
  select.innerHTML =
    '<option value="">Select Class</option>' +
    teacherClasses
      .map((c) => `<option value="${c.id}">${c.name}</option>`)
      .join("");
  document.getElementById("new-assessment-modal").classList.remove("hidden");
});

document.getElementById("create-assessment")?.addEventListener("click", () => {
  const classId = document.getElementById("assessment-class-select").value;
  const assessmentName = document.getElementById("assessment-name").value;
  const maxScore = document.getElementById("assessment-max-score").value;

  if (classId && assessmentName && maxScore) {
    showToast(
      `Assessment "${assessmentName}" created! You can now enter grades.`,
      "success",
    );
    closeModals();
    document.getElementById("assessment-name").value = "";
    document.getElementById("assessment-max-score").value = "";
    showPage("grades");
  } else {
    showToast("Please fill all fields", "error");
  }
});

// =============================================
// REPORTS GENERATION
// =============================================

function loadReports() {
  const teacherClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id,
  );
  const container = document.getElementById("reports-container");
  if (!container) return;

  container.innerHTML = `
        <div class="reports-controls">
            <select id="report-class-select" class="class-select">
                <option value="">Select Class</option>
                ${teacherClasses.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
            <select id="report-assessment-select" class="assessment-select">
                <option>Term 1 - CAT 1</option>
                <option>Term 1 - Mid-term Exam</option>
                <option>Term 1 - CAT 2</option>
                <option>Term 1 - End-term Exam</option>
            </select>
            <button class="btn-primary" id="generate-report-btn"><i class="fas fa-chart-line"></i> Generate Report</button>
        </div>
        <div id="report-results"></div>
    `;

  document
    .getElementById("generate-report-btn")
    ?.addEventListener("click", generateReport);
}

function generateReport() {
  const classId = document.getElementById("report-class-select").value;
  const assessment = document.getElementById("report-assessment-select").value;
  const classData = classes.find((c) => c.id === classId);
  const gradeRecord = gradesRecords.find(
    (g) => g.classId === classId && g.assessment === assessment,
  );

  if (!gradeRecord) {
    document.getElementById("report-results").innerHTML =
      '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No grade data found for this assessment.</p></div>';
    return;
  }

  const students = gradeRecord.students;
  const scores = students.map((s) => s.score);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  document.getElementById("report-results").innerHTML = `
        <div class="report-summary">
            <h4>Performance Summary - ${classData?.name} (${assessment})</h4>
            <div class="report-stats">
                <div class="report-stat"><strong>Average Score</strong><span>${average.toFixed(1)}%</span></div>
                <div class="report-stat"><strong>Highest Score</strong><span>${highest}%</span></div>
                <div class="report-stat"><strong>Lowest Score</strong><span>${lowest}%</span></div>
                <div class="report-stat"><strong>Pass Rate</strong><span>${scores.filter((s) => s >= 50).length}/${scores.length}</span></div>
            </div>
            <div class="report-table-container">
                <table class="report-table">
                    <thead><th>Student Name</th><th>Score</th><th>Grade</th><th>Remarks</th></thead>
                    <tbody>
                        ${students
                          .map((student, idx) => {
                            const grade =
                              student.score >= 80
                                ? "A"
                                : student.score >= 70
                                  ? "B+"
                                  : student.score >= 60
                                    ? "B"
                                    : student.score >= 50
                                      ? "C"
                                      : "D";
                            return `<tr><td>Student ${idx + 1}</td><td>${student.score}%</td><td>${grade}</td><td>${student.remarks || "-"}</td></tr>`;
                          })
                          .join("")}
                    </tbody>
                </table>
            </div>
            <button class="btn-primary" onclick="downloadReport()"><i class="fas fa-download"></i> Download Report</button>
        </div>
    `;
}

function downloadReport() {
  showToast("Report downloaded!", "success");
}

// =============================================
// NAVIGATION
// =============================================

const navLinks = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

function showPage(pageId) {
  pages.forEach((page) => page.classList.remove("active"));
  const activePage = document.getElementById(`${pageId}-page`);
  if (activePage) activePage.classList.add("active");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-page") === pageId) link.classList.add("active");
  });

  if (pageId === "classes") loadClasses();
  else if (pageId === "attendance") loadAttendance();
  else if (pageId === "grades") loadGrades();
  else if (pageId === "assignments") loadAssignments();
  else if (pageId === "materials") loadLearningMaterials();
  else if (pageId === "communication") loadAnnouncements();
  else if (pageId === "timetable") loadTimetable();
  else if (pageId === "reports") loadReports();
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const pageId = link.getAttribute("data-page");
    if (pageId) showPage(pageId);
  });
});

// =============================================
// AUTHENTICATION
// =============================================

registrationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fullname = document.getElementById("reg-fullname").value.trim();
  const teacherId = document
    .getElementById("reg-teacher-id")
    .value.trim()
    .toUpperCase();
  const subject = document.getElementById("reg-subject").value;
  const role = document.getElementById("reg-role").value;
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-confirm-password").value;

  if (password !== confirmPassword) {
    showToast("Passwords do not match!", "error");
    return;
  }
  if (registeredTeachers.some((t) => t.teacherId === teacherId)) {
    showToast("Teacher ID already exists!", "error");
    return;
  }

  const newTeacher = {
    id: Date.now(),
    fullname,
    teacherId,
    subject,
    role,
    email,
    phone,
    password,
  };
  registeredTeachers.push(newTeacher);
  localStorage.setItem(
    STORAGE_KEYS.TEACHERS,
    JSON.stringify(registeredTeachers),
  );

  currentTeacher = newTeacher;
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_TEACHER,
    JSON.stringify(currentTeacher),
  );

  registrationSection.classList.add("hidden");
  portalContainer.classList.add("active");
  updateDashboard();
  showToast(
    "Registration successful! Welcome to the Teacher Portal!",
    "success",
  );
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const teacherId = document
    .getElementById("login-teacher-id")
    .value.trim()
    .toUpperCase();
  const password = document.getElementById("login-password").value;

  const teacher = registeredTeachers.find(
    (t) => t.teacherId === teacherId && t.password === password,
  );

  if (teacher) {
    currentTeacher = teacher;
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_TEACHER,
      JSON.stringify(currentTeacher),
    );

    loginSection.classList.add("hidden");
    portalContainer.classList.add("active");
    updateDashboard();
    showToast(`Welcome back, ${teacher.fullname.split(" ")[0]}!`, "success");
  } else {
    showToast("Invalid Teacher ID or Password", "error");
    document.querySelector("#login-section .auth-card").classList.add("shake");
    setTimeout(
      () =>
        document
          .querySelector("#login-section .auth-card")
          .classList.remove("shake"),
      500,
    );
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
  currentTeacher = null;
  portalContainer.classList.remove("active");
  loginSection.classList.remove("hidden");
  showToast("Logged out successfully!", "info");
});

switchToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registrationSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

switchToRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginSection.classList.add("hidden");
  registrationSection.classList.remove("hidden");
});

document.querySelectorAll(".modal-close, .btn-cancel").forEach((btn) => {
  btn.addEventListener("click", closeModals);
});

window.addEventListener("click", (e) => {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTeacher = localStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER);
  if (savedTeacher) {
    currentTeacher = JSON.parse(savedTeacher);
    if (registeredTeachers.some((t) => t.id === currentTeacher.id)) {
      registrationSection.classList.add("hidden");
      portalContainer.classList.add("active");
      updateDashboard();
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
    }
  }
});

window.viewClass = (classId) => showToast(`Viewing class details`, "info");
window.messageClass = (classId) => showToast(`Messaging class`, "info");
window.viewSubmissions = (assignmentId) =>
  showToast(`Viewing submissions`, "info");
window.deleteAssignment = deleteAssignment;
window.deleteAnnouncement = deleteAnnouncement;
window.deleteMaterial = deleteMaterial;
window.deleteTimetable = deleteTimetable;
window.downloadMaterial = downloadMaterial;
window.downloadTimetable = downloadTimetable;
window.downloadReport = downloadReport;
