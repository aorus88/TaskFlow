const taskReducer = (state, action) => {
  switch (action.type) {
    // ─────────────────────────────────────────
    // 1) NOUVELLE ACTION : SET_TASKS
    //    Pour remplacer la liste de tasks
    //    par celles venant du back-end.
    // ─────────────────────────────────────────
    case "SET_TASKS": {
      // On map pour copier la valeur de `_id` dans `id`,
      // afin de continuer à utiliser `task.id` dans l'appli.
      const tasksFromServer = action.payload.map((serverTask) => {
        const { _id, ...rest } = serverTask;
        return {
          ...rest,
          id: _id, // on copie l'_id dans id
        };
      });

      return {
        ...state,
        tasks: tasksFromServer,
      };
    }

    // ─────────────────────────────────────────
    // 2) (Optionnel) NOUVELLE ACTION : SET_ARCHIVED_TASKS
    //    Si tu as un endpoint GET /tasks/archived
    //    pour charger tes archives depuis le back.
    // ─────────────────────────────────────────
    case "SET_ARCHIVED_TASKS": {
      // Même logique de mapping _id → id
      const archivedTasksFromServer = action.payload.map((serverTask) => {
        const { _id, ...rest } = serverTask;
        return {
          ...rest,
          id: _id,
        };
      });

      return {
        ...state,
        archivedTasks: archivedTasksFromServer,
      };
    }

    // ─────────────────────────────────────────
    // 3) ACTIONS EXISTANTES (inchangées)
    // ─────────────────────────────────────────

    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "DELETE_ARCHIVED_TASK":
      return {
        ...state,
        archivedTasks: state.archivedTasks.filter(
          (task) => task.id !== action.payload
        ),
      };

    case "EDIT_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case "ADD_SUBTASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.parentId
            ? {
                ...task,
                subtasks: [...task.subtasks, action.payload.subtask],
              }
            : task
        ),
      };

    case "DELETE_SUBTASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter(
                  (subtask) => subtask.id !== action.payload.subtaskId
                ),
              }
            : task
        ),
      };

    case "UPDATE_SUBTASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === action.payload.subtaskId
                    ? { ...subtask, ...action.payload.updatedData }
                    : subtask
                ),
              }
            : task
        ),
      };

    case "ARCHIVE_TASK": {
      const taskToArchive = state.tasks.find(
        (task) => task.id === action.payload.taskId
      );
      if (!taskToArchive) return state;

      return {
        ...state,
        tasks: state.tasks.filter(
          (task) => task.id !== action.payload.taskId
        ),
        archivedTasks: [
          ...state.archivedTasks,
          {
            ...taskToArchive,
            status: "closed",
            archivedAt: action.payload.archivedAt,
          },
        ],
      };
    }

    case "UPDATE_TASK_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                status: action.payload.newStatus,
                completedAt: action.payload.completedAt || task.completedAt,
              }
            : task
        ),
      };

    case "UPDATE_TASK_TIME":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, timeSpent: action.payload.timeSpent }
            : task
        ),
      };

    default:
      return state;
  }
};

export default taskReducer;
