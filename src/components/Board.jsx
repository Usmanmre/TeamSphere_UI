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
import { Phone } from "lucide-react"; // Make sure this import is added
const Board = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState();
  const [localTeam, setLocalTeam] = useState([]);
  const [meetingURL, setMeetingURL] = useState(null);


  const { currentBoard, myOnlineUsers } = useBoard();

  const {
    getAllTasks,
    myTasks,
    tasksLoading,
    mySelectedTask,
    selectedTaskGlobal,
    myTeam,
  } = useTasks();
  const { auth } = useAuth();
  const [columns, setColumns] = useState({});

  useEffect(() => {
    if (!Array.isArray(myTeam) || !Array.isArray(myOnlineUsers)) return;

    const updatedTeam = myTeam.map((member) => ({
      ...member,
      status: myOnlineUsers.includes(member.email) ? "online" : "offline",
    }));

    updatedTeam.sort((a, b) => {
      if (a.status === "online" && b.status === "offline") return -1;
      if (a.status === "offline" && b.status === "online") return 1;
      return 0;
    });
    setLocalTeam(updatedTeam);
  }, [myTeam, myOnlineUsers]);

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
        getAllTasks();
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

  const setSelectedTaskGlobally = (task) => {
    selectedTaskGlobal(task);
    setModalOpen(true);
  };

  function authorizeZoom() {
const BACKEND_URL = "https://aesthetic-lorianna-teamsphere-b28ca5af.koyeb.app"; // Your Koyeb backend URL
    
    const clientId = "U4YD8oaCTNG0joA80m0B8Q";
    const redirectUri = `${BACKEND_URL}/api/zoom/callback`;
    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
  
    const popup = window.open(
      zoomAuthUrl,
      "Zoom Authorization",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  
    // Listen for postMessage from popup
    window.addEventListener("message", function handler(event) {
      if (event.origin !== "http://localhost:3001") return; // adjust to your backend URL
      if (event.data.type === "zoom-auth-success") {
        console.log("Meeting Link:", event.data.meeting.join_url);
        const url = event.data.meeting.join_url
        setMeetingURL(url)
        // Show to user, store, or send to backend
      }
      window.removeEventListener("message", handler);
      popup.close();
    });
  }
  

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
                            onClick={() => setSelectedTaskGlobally(task)}
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

        <div className="fixed bottom-4 right-4 z-50">
          {/* Toggle Button (Only shows when modal is closed) */}
          {!isOpen && (
            <div
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-br from-purple-600 to-indigo-500 hover:shadow-purple-600/50 text-white w-fit px-4 py-2 rounded-full shadow-lg cursor-pointer transition-all"
            >
              View Team 
            </div>
          )}

          {/* Chat-style Modal */}
          {isOpen && (
            <div className="mt-2 w-72 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <span className="font-semibold text-green-500">
                  Team Members
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-red-200 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="max-h-64 overflow-y-auto px-4 py-2 space-y-3">
                {localTeam && localTeam.length > 0 ? (
                  localTeam.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-orange-50 dark:bg-gray-800 hover:bg-gray-600 cursor-pointer p-2 rounded-md"
                    >
                      <span>{member.name}</span>
                      <span className="flex items-center gap-2">
                        {member.status === "online" && (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span onClick={() => authorizeZoom()}>
                              <Phone className="w-4 h-4 text-green-500 cursor-pointer hover:text-green-600" />
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No member online
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={mySelectedTask ? updateTask : createTask}
        taskData={mySelectedTask}
      />
    </div>
  );
};

export default Board;
