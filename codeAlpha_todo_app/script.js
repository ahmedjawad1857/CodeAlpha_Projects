
let tasks = [];
let editIndex = -1;

const showToast = (title, text, icon) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    icon: icon,
    title: title,
    text: text,
    timerProgressBar: true,
    background: "#fff",
    color: "#000",
    padding: "10px",
  });
};

const loadTasks = () => {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    updateTaskList();
  }
};

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const value = taskInput.value.trim();
  if (!value) {
    showToast("Error!", "Task cannot be empty", "error");
    return;
  }

  if (editIndex >= 0) {
    tasks[editIndex].text = value;
    resetEditMode();
    showToast("Success!", "Task updated successfully", "success");
  } else {
    tasks.push({ text: value, completed: false });
    showToast("Success!", "Task added successfully", "success");
  }

  taskInput.value = "";
  updateTaskList();
  saveTasks();
};

const resetEditMode = () => {
  editIndex = -1;
  document.getElementById("updateTask").style.display = "none";
  document.getElementById("cancelUpdate").style.display = "none";
  document.getElementById("newTask").style.display = "block";
};

const updateTaskList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.toggle("editing", index === editIndex);

    li.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <label class="checkbox-btn">
            <input id="checkbox-${index}" type="checkbox" ${
      task.completed ? "checked" : ""
    } />
            <span class="checkmark"></span>
          </label>
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <i class="${
            task.completed
              ? "disabled fa-solid fa-pen-to-square"
              : "fa-solid fa-pen-to-square"
          }" onclick="${task.completed ? "" : `editTask(${index})`}"></i>
          <i class="fa-solid fa-trash-can" onclick="deleteTask(${index})"></i>
        </div>
      </div>
    `;

    li.querySelector("input").addEventListener("change", () =>
      toggleTaskComplete(index)
    );
    taskList.appendChild(li);
  });

  updateStats();
  updateButtonVisibility(); // Update button visibility here
};

const toggleTaskComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;
  updateTaskList();
  saveTasks();
  updateStats();
};

const deleteTask = (index) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    backdrop: true,
    background: "#fff",
    color: "#000",
    customClass: {
      title: "swal-title",
      content: "swal-content",
      confirmButton: "swal-confirm-button",
      cancelButton: "swal-cancel-button",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      tasks.splice(index, 1);
      if (editIndex === index) {
        resetEditMode();
      }
      updateTaskList();
      saveTasks();
      showToast("Deleted!", "Your task has been deleted.", "success");
    }
  });
};

const editTask = (index) => {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = tasks[index].text;
  editIndex = index;

  document.getElementById("newTask").style.display = "none";
  document.getElementById("updateTask").style.display = "block";
  document.getElementById("cancelUpdate").style.display = "block";

  updateTaskList(); // Re-render the task list to apply the highlighting

  const onTaskInputChange = () => {
    document.getElementById("updateTask").disabled =
      taskInput.value.trim() === tasks[editIndex].text;
  };

  taskInput.removeEventListener("input", onTaskInputChange); // Remove any existing listener to avoid duplication
  taskInput.addEventListener("input", onTaskInputChange);
  onTaskInputChange(); // Initial check to set the button state correctly
};

const cancelUpdate = () => {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = "";
  resetEditMode();
  updateTaskList();
};

const updateStats = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  const progressBar = document.getElementById("progress");
  progressBar.style.width = `${progress}%`;
  document.getElementById(
    "numbers"
  ).innerText = `${completedTasks} / ${totalTasks} `;

  if (totalTasks && completedTasks === totalTasks) {
    for (let i = 0; i < 4; i++) {
      blastConfetti();
    }
  }
};

const blastConfetti = () => {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  const fire = (particleRatio, opts) => {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    );
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

// Add functionality for 'Delete All Tasks' button
const deleteAllTasks = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete all tasks!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete all",
    cancelButtonText: "Cancel",
    backdrop: true,
    background: "#fff",
    color: "#000",
    customClass: {
      title: "swal-title",
      content: "swal-content",
      confirmButton: "swal-confirm-button",
      cancelButton: "swal-cancel-button",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = [];
      updateTaskList();
      saveTasks();
      showToast("Deleted!", "All tasks have been deleted.", "success");
    }
  });
};

// Add functionality for 'Complete All Tasks' button
const completeAllTasks = () => {
  tasks.forEach((task) => (task.completed = true));
  updateTaskList();
  saveTasks();
  showToast(
    "Completed!",
    "All tasks have been marked as completed.",
    "success"
  );
};

// Add functionality for 'Uncomplete All Tasks' button
const uncompleteAllTasks = () => {
  tasks.forEach((task) => (task.completed = false));
  updateTaskList();
  saveTasks();
  showToast("Updated!", "All tasks have been marked as incomplete.", "success");
};

// Update button visibility
const updateButtonVisibility = () => {
  const deleteAllButton = document.getElementById("deleteAll");
  const completeAllButton = document.getElementById("completeAll");
  const uncompleteAllButton = document.getElementById("uncompleteAll");

  const hasTasks = tasks.length > 0;
  deleteAllButton.style.display = hasTasks ? "block" : "none";
  completeAllButton.style.display = hasTasks ? "block" : "none";
  uncompleteAllButton.style.display = hasTasks ? "block" : "none";
};

document.getElementById("newTask").addEventListener("click", (e) => {
  e.preventDefault();
  addTask();
});

document.getElementById("updateTask").addEventListener("click", (e) => {
  e.preventDefault();
  addTask();
});

document.getElementById("cancelUpdate").addEventListener("click", (e) => {
  e.preventDefault();
  cancelUpdate();
});

document.getElementById("deleteAll").addEventListener("click", deleteAllTasks);
document
  .getElementById("completeAll")
  .addEventListener("click", completeAllTasks);
document
  .getElementById("uncompleteAll")
  .addEventListener("click", uncompleteAllTasks);

// Initial load
loadTasks();
