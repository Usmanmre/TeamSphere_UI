import React, { useEffect, useState } from "react";
import { useBoard } from "../Global_State/BoardsContext";
import { useTasks } from "../Global_State/TaskContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskModal from "./TaskModal";
import toast from "react-hot-toast";
import { useAuth } from "../Global_State/AuthContext";
import socket from "../socket";
// import BASE_URL from "../config";
import BASE_URL from "../config";

const Board = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState();
  const { currentBoard } = useBoard();
  const { getAllTasks, myTasks, tasksLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);
  const { auth } = useAuth();

  const [columns, setColumns] = useState({});

  useEffect(() => {
    const handleTaskUpdate = (message) => {

      // Delay toast notification for better UX
      setTimeout(() => {
        toast.success(message?.message);
      }, 5000);

      // Re-fetch all tasks
      getAllTasks();
    };
    // Attach event listener
    socket.on("taskUpdated", handleTaskUpdate);
    return () => {
      // Cleanup: Remove listener to prevent duplication
      socket.off("taskUpdated", handleTaskUpdate);
    };
  }, [getAllTasks]); // Depend on getAllTasks to avoid stale closures
  useEffect(() => {
    if (currentBoard) {
      getAllTasks();
    }
  }, [currentBoard, newTask]);

  useEffect(() => {
    if (!tasksLoading && myTasks) {
      const groupedTasks = {
        todo: {
          id: "todo",
          name: "To Do",
          tasks: myTasks.filter((task) => task.status === "todo"),
        },
        inProgress: {
          id: "inProgress",
          name: "In Progress",
          tasks: myTasks.filter((task) => task.status === "inProgress"),
        },
        done: {
          id: "done",
          name: "Done",
          tasks: myTasks.filter((task) => task.status === "done"),
        },
      };
      setColumns(groupedTasks);
    }
  }, [tasksLoading, myTasks]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceCol = columns[result.source.droppableId];
    const sourceTasks = [...sourceCol.tasks];

    if (result.destination.droppableId === result.source.droppableId) {
      // Same column - reorder as usual
      const [movedTask] = sourceTasks.splice(result.source.index, 1);
      sourceTasks.splice(result.destination.index, 0, movedTask);

      setColumns({
        ...columns,
        [sourceCol.id]: { ...sourceCol, tasks: sourceTasks },
      });
    } else {
      // Moving to a different column - always insert at the top
      const destCol = columns[result.destination.droppableId];
      const destTasks = [...destCol.tasks];
      const [movedTask] = sourceTasks.splice(result.source.index, 1);
      movedTask.status = result.destination.droppableId; // Update status

      destTasks.unshift(movedTask); // ⬅️ Always insert at the top

      setColumns({
        ...columns,
        [sourceCol.id]: { ...sourceCol, tasks: sourceTasks },
        [destCol.id]: { ...destCol, tasks: destTasks },
      });

      updateTaskStatus(result);
    }
  };

  const createTask = async (task) => {
    const newTaskData = { ...task };
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/task/create-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
        body: JSON.stringify(newTaskData),
      });

      if (response.ok) {
        const result = await response.json();
        setNewTask(result);
        toast.success(result?.message);
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const updateTask = async (task) => {
    const newTaskData = { ...task };
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/task/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
        body: JSON.stringify(newTaskData),
      });
      if (response.ok) {
        const result = await response.json();
        setNewTask(result);
        toast.success(result.message);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const updateTaskStatus = async (result) => {
    if (result?.source?.droppableId !== result?.destination?.droppableId) {
      const _id = result?.draggableId;
      const updatedStatus = result?.destination?.droppableId;
      const updatedTaskData = { _id, updatedStatus };

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/api/task/updateStatus`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: ` ${token}`,
          },
          body: JSON.stringify(updatedTaskData),
        });
        if (response.ok) {
          const result = await response.json();
          setNewTask(result);
          toast.success(result.message);
        }
      } catch (err) {
        console.error("Error updating task status:", err);
      }
    }
  };

  return (
    <div>
      <main className="w-full h-screen flex gap-4 p-6 bg-gradient-to-br text-gray-100 from-[#111827] to-[#1F2937]">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.values(columns).map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mx-2 h-fit justify-start   p-4 w-1/5 bg-white/10 rounded-2xl shadow-lg border border-white/10  "
                  style={{ backgroundColor: "#101204" }}
                >
                  <h3 className="font-semibold w-fit">{column.name}</h3>

                  {tasksLoading ? (
                    <p className="text-gray-400 mt-4">Tasks Loading...</p>
                  ) : column.tasks.length > 0 ? (
                    column.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer flex items-center rounded-md p-2 mt-4 transition-all duration-200 ${
                              snapshot.isDragging
                                ? "scale-105 border-2 border-yellow-600 bg-slate-700"
                                : "bg-slate-800 hover:border hover:border-yellow-600"
                            }`}
                            onClick={() => (
                              setSelectedTask(task), setModalOpen(true)
                            )}
                          >
                            {task.title || ""}
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-gray-400 mt-4">No tasks added yet.</p>
                  )}

                  {provided.placeholder}
                  <button
                    className={`relative flex items-center p-1 rounded-md justify-start mt-4 ${
                      auth?.user?.role === "manager"
                        ? "hover:bg-slate-800 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (auth?.user?.role !== "manager") {
                        toast.error("Only managers can add cards!");
                        return;
                      }

                      setModalOpen(true);
                    }}
                  >
                    + Add a card
                  </button>
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </main>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedTask ? updateTask : createTask}
        taskData={selectedTask}
      />
    </div>
  );
};

export default Board;
