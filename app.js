// 1. OOP Concept: Classes and Objects
// We define a Task class to represent the blueprint of a single task object.
class Task {
  constructor(id, title, description, priority) {
    this.id = id;
    this.title = title;
    this.description = description;
    // Priority levels: 3 (High), 2 (Medium), 1 (Low)
    this.priority = priority;
    this.completed = false;
    this.createdAt = Date.now();
  }
}

// 2. DSA Concept: Max-Heap (Priority Queue)
// A binary heap implemented using an array. It ensures we can always get the 
// highest priority task in O(1) time and insert/delete in O(log N) time.
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  // Get index of the parent node
  parent(i) { return Math.floor((i - 1) / 2); }
  // Get index of the left child node
  leftChild(i) { return 2 * i + 1; }
  // Get index of the right child node
  rightChild(i) { return 2 * i + 2; }

  // Swap two elements in the heap
  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  // Task comparison logic: Primarily by Priority (Higher is better),
  // Secondarily by CreatedAt (Older is more important)
  compare(task1, task2) {
    if (task1.priority === task2.priority) {
       return task1.createdAt < task2.createdAt ? 1 : -1; // Older first
    }
    return task1.priority > task2.priority ? 1 : -1; // Higher priority first
  }

  // Insert a new task into the heap - O(log N) Time Complexity
  insert(task) {
    this.heap.push(task);
    this.heapifyUp(this.heap.length - 1);
  }

  // Maintains heap property from bottom up 
  heapifyUp(i) {
    while (i > 0 && this.compare(this.heap[i], this.heap[this.parent(i)]) > 0) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  // Remove and return the maximum element (Highest priority task) - O(log N) Time Complexity
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return max;
  }

  // Maintains heap property from top down
  heapifyDown(i) {
    let maxIndex = i;
    const l = this.leftChild(i);
    const r = this.rightChild(i);

    if (l < this.heap.length && this.compare(this.heap[l], this.heap[maxIndex]) > 0) {
      maxIndex = l;
    }
    if (r < this.heap.length && this.compare(this.heap[r], this.heap[maxIndex]) > 0) {
      maxIndex = r;
    }

    if (maxIndex !== i) {
      this.swap(i, maxIndex);
      this.heapifyDown(maxIndex);
    }
  }

  // Helper to re-generate the entire queue from our hash map
  buildFromMap(map) {
      this.heap = [];
      map.forEach(task => {
          if(!task.completed) {
            this.insert(task); // Re-inserting into the Max-Heap Priority Queue
          }
      });
  }
}

// 3. OOP & DSA Integration: Task Manager
// Encapsulates the operations for managing our to-do list using a Hash Map and a Max Heap.
class TaskManager {
  constructor() {
    // Hash Map: Provides O(1) time complexity for lookup by ID and deletion state tracking.
    this.tasksMap = new Map();
    // Priority Queue: Provides O(log N) time complexity for insertion and maintains priority-ordered flow.
    this.priorityQueue = new MaxHeap();
  }

  // Create a new task and add it to our data structures
  addTask(title, description, priority) {
    // ID generation
    const id = "task_" + Math.random().toString(36).substr(2, 9);
    const newTask = new Task(id, title, description, priority);
    
    // Add to Hash Map O(1)
    this.tasksMap.set(id, newTask);
    
    // Add to Priority Queue O(log N)
    this.priorityQueue.insert(newTask);
    
    return newTask;
  }

  // Sub-task: Removing task completely O(1) look up + Heap rebuild. 
  deleteTask(id) {
    if (this.tasksMap.has(id)) {
      this.tasksMap.delete(id);
      this.priorityQueue.buildFromMap(this.tasksMap); // Regenerate heap based on remaining items
    }
  }

  // O(1) update function
  toggleTaskCompletion(id) {
    const task = this.tasksMap.get(id);
    if (task) {
      task.completed = !task.completed;
      this.priorityQueue.buildFromMap(this.tasksMap); // Regenerate the priority queue state
    }
  }

  // Returns all active tasks sorted by priority by extracting from a copied heap. O(N log N)
  getSortedPendingTasks() {
      // Rebuild a pure clone of the queue so we don't destroy our main queue when sorting to view
      const tempHeap = new MaxHeap();
      tempHeap.buildFromMap(this.tasksMap);
      
      const sorted = [];
      let nextTask = tempHeap.extractMax();
      while (nextTask) {
          sorted.push(nextTask);
          nextTask = tempHeap.extractMax();
      }
      return sorted;
  }
  
  // Returns finished tasks 
  getCompletedTasks() {
      const completed = [];
      this.tasksMap.forEach(task => {
          if (task.completed) completed.push(task);
      });
      // Sort by recency for display
      return completed.sort((a,b) => b.createdAt - a.createdAt);
  }
}

// ============================================
// UI Controllers (OOP Principles applied to UI)
// ============================================
class UIController {
  constructor() {
    this.taskManager = new TaskManager();
    this.initElements();
    this.addEventListeners();
    this.render();
  }

  initElements() {
    this.form = document.getElementById('task-form');
    this.titleInput = document.getElementById('task-title');
    this.descInput = document.getElementById('task-desc');
    this.priorityInput = document.getElementById('task-priority');
    
    this.pendingContainer = document.getElementById('pending-list');
    this.completedContainer = document.getElementById('completed-list');
  }

  addEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  handleFormSubmit() {
    const title = this.titleInput.value.trim();
    const desc = this.descInput.value.trim();
    const priority = parseInt(this.priorityInput.value, 10);

    if (title === "") return;

    this.taskManager.addTask(title, desc, priority);
    
    // Clear inputs
    this.titleInput.value = '';
    this.descInput.value = '';
    this.priorityInput.value = '1';
    
    // Re-render
    this.render();
  }

  handleDelete(id) {
      this.taskManager.deleteTask(id);
      this.render();
  }

  handleToggle(id) {
      this.taskManager.toggleTaskCompletion(id);
      this.render();
  }

  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if(task.completed) li.classList.add('completed');
    
    // Get text representation of priority
    const priorityMap = { 3: "High", 2: "Medium", 1: "Low" };
    const priorityClass = `priority-${task.priority}`;

    li.innerHTML = `
      <div class="task-content">
        <div class="task-header">
           <h3>${task.title}</h3>
           <span class="badge ${priorityClass}">${priorityMap[task.priority]}</span>
        </div>
        <p>${task.description || "No description provided."}</p>
      </div>
      <div class="task-actions">
        <button class="btn toggle-btn" onclick="app.handleToggle('${task.id}')">
            ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="btn delete-btn" onclick="app.handleDelete('${task.id}')">Delete</button>
      </div>
    `;
    return li;
  }

  render() {
      // Clear containers
      this.pendingContainer.innerHTML = '';
      this.completedContainer.innerHTML = '';

      // Get organized data from our DSA structures
      const pendingTasks = this.taskManager.getSortedPendingTasks();
      const completedTasks = this.taskManager.getCompletedTasks();

      if(pendingTasks.length === 0) {
          this.pendingContainer.innerHTML = '<p class="empty-state">No pending tasks. You are all caught up!</p>';
      } else {
          pendingTasks.forEach(task => {
              this.pendingContainer.appendChild(this.createTaskElement(task));
          });
      }

      if(completedTasks.length === 0) {
           this.completedContainer.innerHTML = '<p class="empty-state">No completed tasks yet.</p>';
      } else {
           completedTasks.forEach(task => {
              this.completedContainer.appendChild(this.createTaskElement(task));
          });
      }
  }
}

// Bootstrap application
const app = new UIController();
