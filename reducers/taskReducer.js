import {
  ADD_TASK,
  DELETE_TASK,
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  ADD_SUBTASK,
  TOGGLE_SUBTASK,
  DELETE_SUBTASK,
  UPDATE_TASK_TIME,
  EDIT_TASK, // Ajout de l'importation pour l'édition
} from "./actionTypes";

const taskReducer = (state, action) => {
  switch (action.type) {
    case ADD_TASK: {
      const newTasks = [...state.tasks, action.payload];
      updateLocalStorage("tasks", newTasks);
      return { ...state, tasks: newTasks };
    }

    case DELETE_TASK: {
      const filteredTasks = state.tasks.filter((task) => task.id !== action.payload);
      updateLocalStorage("tasks", filteredTasks);
      return { ...state, tasks: filteredTasks };
    }

    case "EDIT_TASK": {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload.id ? action.payload : task
      );
      updateLocalStorage("tasks", updatedTasks); // Sauvegarde dans localStorage (facultatif)
      return { ...state, tasks: updatedTasks };
    }

    case "ARCHIVE_TASK": {
      const taskToArchive = state.tasks.find((task) => task.id === action.payload.taskId);
      if (!taskToArchive) return state;
    
      const updatedTasks = state.tasks.filter((task) => task.id !== action.payload.taskId);
      const archivedTask = { ...taskToArchive, archivedAt: action.payload.archivedAt };
    
      updateLocalStorage("tasks", updatedTasks);
      const updatedArchivedTasks = [...state.archivedTasks, archivedTask];
      updateLocalStorage("archivedTasks", updatedArchivedTasks);
    
      return { ...state, tasks: updatedTasks, archivedTasks: updatedArchivedTasks };
    }
    

    case ADD_CATEGORY: {
      const updatedCategories = [...state.categories, action.payload];
      updateLocalStorage("categories", updatedCategories);
      return { ...state, categories: updatedCategories };
    }

    case REMOVE_CATEGORY: {
      const filteredCategories = state.categories.filter((cat) => cat !== action.payload);
      updateLocalStorage("categories", filteredCategories);
      return { ...state, categories: filteredCategories };
    }

    case ADD_SUBTASK: {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload.parentId
          ? {
              ...task,
              subtasks: task.subtasks
                ? [...task.subtasks, action.payload.subtask]
                : [action.payload.subtask],
            }
          : task
      );
      updateLocalStorage("tasks", updatedTasks);
      return { ...state, tasks: updatedTasks };
    }

    case TOGGLE_SUBTASK: {
      const toggledTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === action.payload.subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : task
      );
      updateLocalStorage("tasks", toggledTasks);
      return { ...state, tasks: toggledTasks };
    }

    case DELETE_SUBTASK: {
      const tasksAfterSubtaskDeletion = state.tasks.map((task) =>
        task.id === action.payload.taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(
                (subtask) => subtask.id !== action.payload.subtaskId
              ),
            }
          : task
      );
      updateLocalStorage("tasks", tasksAfterSubtaskDeletion);
      return { ...state, tasks: tasksAfterSubtaskDeletion };
    }

    case UPDATE_TASK_TIME: {
      const tasksWithUpdatedTime = state.tasks.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, timeSpent: (task.timeSpent || 0) + action.payload.timeSpent }
          : task
      );
      updateLocalStorage("tasks", tasksWithUpdatedTime);
      return { ...state, tasks: tasksWithUpdatedTime };
    }

    default:
      return state;
  }
};

// Fonction utilitaire pour mettre à jour localStorage
const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export default taskReducer;
