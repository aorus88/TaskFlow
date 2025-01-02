const taskReducer = (state, action) => {
  switch (action.type) {

    // ────────────────────────────────────────────────────────────────
    // 1) NOUVELLE ACTION : SET_TASKS
    //    Pour remplacer la liste de tasks
    //    par celles venant du back-end.
    // ────────────────────────────────────────────────────
    case "SET_TASKS": {
      const tasksFromServer = action.payload.map((serverTask) => {
        return {
          ...serverTask,
          // On mappe _id vers id pour être cohérent avec le front
          id: serverTask._id,
          // On s'assure que chaque sous-tâche ait aussi un id
          subtasks: serverTask.subtasks?.map((subtask) => ({
            ...subtask,
            id: subtask._id,
          })) || [],
        };
      });
      return {
        ...state,
        tasks: tasksFromServer,
      };
    }

        // Ajouter un nouveau cas pour SET_SELECTED_TASK_ID (pour selection tâche minuteur pomodoro)
        case "SET_SELECTED_TASK_ID":
          return {
            ...state,
            selectedTaskId: action.payload,
          };


//    // 1a) NOUVELLE ACTION : SET_TASKS pour les consommations / FUSION-TOOL
    case "SET_CONSUMPTION_ENTRIES":
      return {
        ...state,
        consumptionEntries: action.payload,
      };



    // ────────────────────────────────────────────────────
    // 2) ARCHIVAGE D'UNE TÂCHE
    // ────────────────────────────────────────────────────
    case "SET_ARCHIVED_AT": {
      const { taskId } = action.payload;
      const archivedDate = new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, archivedAt: archivedDate } : task
        ),
      };
    }

    // ────────────────────────────────────────────────────
    // 3) AJOUT D'UNE TÂCHE
    // ────────────────────────────────────────────────────
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    // ────────────────────────────────────────────────────
    // 4) SUPPRESSION D'UNE TÂCHE
    // ────────────────────────────────────────────────────
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    // ────────────────────────────────────────────────────
    // 5) AJOUT D'UNE SOUS-TÂCHE
    // ────────────────────────────────────────────────────
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

      // 5c) MISE À JOUR DU TEMPS D'UNE SOUS-TÂCHE
      case "TOGGLE_SUBTASK_STATUS":
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === action.payload.taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === action.payload.subtaskId
                      ? {
                          ...subtask,
                          archived: subtask.archived === "open" ? "closed" : "open",
                          archivedAt: subtask.archived === "open" ? new Date().toISOString() : null,
                        }
                      : subtask
                  ),
                }
              : task
          ),
        };

    // ────────────────────────────────────────────────────
    // 6) SUPPRESSION D'UNE SOUS-TÂCHE
    // ────────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────────
    // 7) MISE À JOUR DU TEMPS D'UNE TÂCHE
    // ────────────────────────────────────────────────────
    case "UPDATE_TASK_TIME":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                totalTime: action.payload.updatedTask.totalTime,
                currentSessionTime: action.payload.updatedTask.currentSessionTime,
                sessions: action.payload.updatedTask.sessions, // Mettre à jour les sessions
              }
            : task
        ),
      };

    // ────────────────────────────────────────────────────
    // 8) MODIFICATION D'UNE TÂCHE (EDIT)
    // ────────────────────────────────────────────────────
    case "EDIT_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                ...action.payload.updatedFields,
              }
            : task
        ),
      };

    default:
      return state;
  }
};

export default taskReducer;
