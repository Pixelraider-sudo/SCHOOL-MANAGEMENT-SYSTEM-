document.addEventListener("DOMContentLoaded", () => {
  // 1. Elements
  const darkToggle = document.getElementById("darkToggle");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const greeting = document.getElementById("greeting");
  const todayDate = document.getElementById("todayDate");

  // 2. Event Listeners (Check if they exist first to avoid null errors)
  if (darkToggle) {
    darkToggle.onclick = () => document.body.classList.toggle("dark");
  }

  if (menuToggle && sidebar) {
    menuToggle.onclick = () => sidebar.classList.toggle("collapsed");
  }

  // 3. Greeting Logic
  if (greeting && todayDate) {
    const hour = new Date().getHours();
    if (hour < 12) greeting.innerText = "Good Morning 👋";
    else if (hour < 18) greeting.innerText = "Good Afternoon 👋";
    else greeting.innerText = "Good Evening 👋";
    todayDate.innerText = new Date().toDateString();
  }

  // 4. Initialize Charts (Only if the Canvas elements exist)
  const perfCtx = document.getElementById("performanceChart");
  if (perfCtx) {
    new Chart(perfCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [
          {
            label: "Average Score",
            data: [65, 59, 80, 81, 56],
            borderColor: "#3498db",
            borderWidth: 2,
          },
        ],
      },
    });
  }

  // Initial Load of Data
  displayStudents();
});

// 5. Student Management Logic (Keep these global so HTML onclick works)
let students = JSON.parse(localStorage.getItem("students")) || [];
let editIndex = null;

function saveStudent() {
  const name = document.getElementById("studentName").value;
  const studentClass = document.getElementById("studentClass").value;
  const email = document.getElementById("studentEmail").value;

  if (!name || !studentClass || !email) return alert("Please fill all fields");

  if (editIndex !== null) {
    // Update existing student but keep their original ID
    students[editIndex] = {
      ...students[editIndex],
      name,
      class: studentClass,
      email,
    };
    editIndex = null;
  } else {
    // Create new student
    const student = {
      id: "STU-" + Math.floor(Math.random() * 10000),
      name,
      class: studentClass,
      email,
    };
    students.push(student);
  }

  localStorage.setItem("students", JSON.stringify(students));
  displayStudents();
  closeStudentForm();
}

function displayStudents() {
  const tableBody = document.getElementById("studentTable");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  students.forEach((student, index) => {
    tableBody.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.email}</td>
                <td>
                    <i class="fas fa-edit" onclick="editStudent(${index})" style="cursor:pointer; color: #3498db; margin-right: 10px;"></i>
                    <i class="fas fa-trash" onclick="deleteStudent(${index})" style="cursor:pointer; color: #e74c3c;"></i>
                </td>
            </tr>`;
  });
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    localStorage.setItem("students", JSON.stringify(students));
    displayStudents();
  }
}

function editStudent(index) {
  const student = students[index];
  document.getElementById("studentName").value = student.name;
  document.getElementById("studentClass").value = student.class;
  document.getElementById("studentEmail").value = student.email;

  editIndex = index;
  openStudentForm();
}

// Helper UI Functions
function openStudentForm() {
  document.getElementById("studentModal").style.display = "flex";
}
function closeStudentForm() {
  document.getElementById("studentModal").style.display = "none";
  editIndex = null; // Important: reset edit state
  clearForm();
}
function clearForm() {
  document.getElementById("studentName").value = "";
  document.getElementById("studentClass").value = "";
  document.getElementById("studentEmail").value = "";
}
