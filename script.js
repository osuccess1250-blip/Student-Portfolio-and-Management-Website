/* ============================================================
   MAIN JAVASCRIPT — Success Onyibe Portfolio
   ============================================================ */


/* ── 1. NAVIGATION (hamburger toggle) ── */

const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}


/* ── 2. CONTACT FORM VALIDATION ── */

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const phone   = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    let hasError = false;

    if (name === "") { showError("name-error", "Please enter your name."); hasError = true; }

    if (email === "") {
      showError("email-error", "Please enter your email address."); hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("email-error", "Please enter a valid email."); hasError = true;
    }

    if (phone === "") {
      showError("phone-error", "Please enter your phone number."); hasError = true;
    } else if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      showError("phone-error", "Phone must be 7-15 digits."); hasError = true;
    }

    if (message === "") { showError("message-error", "Please write a message."); hasError = true; }

    if (!hasError) {
      contactForm.reset();
      const successBox = document.getElementById("form-success");
      if (successBox) {
        successBox.classList.add("show");
        setTimeout(function () { successBox.classList.remove("show"); }, 5000);
      }
    }
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("show"); }
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach(function (el) {
    el.textContent = ""; el.classList.remove("show");
  });
}


/* ── 3. ACADEMIC PLANNER ── */

const plannerForm = document.getElementById("planner-form");

if (plannerForm) {
  let tasks = loadTasks();
  let currentFilter = "all";

  renderTasks();
  updateStats();

  plannerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const taskInput     = document.getElementById("task-input");
    const priorityInput = document.getElementById("task-priority");
    const text          = taskInput.value.trim();
    if (text === "") return;

    tasks.push({ id: Date.now(), text: text, priority: priorityInput.value, done: false });
    saveTasks();
    renderTasks();
    updateStats();
    taskInput.value = "";
    taskInput.focus();
  });

  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderTasks();
    });
  });

  function renderTasks() {
    const list = document.getElementById("task-list");
    if (!list) return;

    const filtered = tasks.filter(function (task) {
      if (currentFilter === "pending") return !task.done;
      if (currentFilter === "done")    return task.done;
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<p class="planner-empty">No tasks here yet. Add one above!</p>';
      return;
    }

    list.innerHTML = filtered.map(function (task) {
      return `
        <div class="task-item ${task.done ? "done" : ""}" data-id="${task.id}">
          <button class="task-checkbox" data-action="toggle" title="Mark complete">
            ${task.done ? "&#10003;" : ""}
          </button>
          <span class="task-text">${escapeHtml(task.text)}</span>
          <span class="task-priority priority-${task.priority}">${task.priority}</span>
          <button class="task-delete" data-action="delete" title="Delete task">&#10005;</button>
        </div>
      `;
    }).join("");

    list.querySelectorAll("[data-action='toggle']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggleTask(parseInt(btn.closest(".task-item").getAttribute("data-id")));
      });
    });

    list.querySelectorAll("[data-action='delete']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteTask(parseInt(btn.closest(".task-item").getAttribute("data-id")));
      });
    });
  }

  function toggleTask(id) {
    tasks = tasks.map(function (t) { return t.id === id ? { ...t, done: !t.done } : t; });
    saveTasks(); renderTasks(); updateStats();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks(); renderTasks(); updateStats();
  }

  function updateStats() {
    const done    = tasks.filter(function (t) { return t.done; }).length;
    const pending = tasks.length - done;
    const el = document.getElementById("planner-stats");
    if (el) {
      el.innerHTML = `
        <span class="planner-stat">Total: <strong>${tasks.length}</strong></span>
        <span class="planner-stat">Done: <strong>${done}</strong></span>
        <span class="planner-stat">Pending: <strong>${pending}</strong></span>
      `;
    }
  }

  function saveTasks()  { localStorage.setItem("portfolio-tasks", JSON.stringify(tasks)); }
  function loadTasks()  { try { return JSON.parse(localStorage.getItem("portfolio-tasks")) || []; } catch(e) { return []; } }

  function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
}
