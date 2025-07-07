import React, { useEffect, useState } from "react";
import { useBoard } from "../Global_State/BoardsContext";
import { useTasks } from "../Global_State/TaskContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskModal from "./TaskModal";
import toast from "react-hot-toast";
import { useAuth } from "../Global_State/AuthContext";
import socket from "../socket";
import BASE_URL from "../config";
import { Phone, Users, Plus, X, Clock, AlertCircle, CheckCircle, MoreHorizontal } from "lucide-react";

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
      setTimeout(() => {
        toast.success(message?.message);
      }, 5000);
      getAllTasks();
    };
    socket.on("taskUpdated", handleTaskUpdate);
    return () => {
      socket.off("taskUpdated", handleTaskUpdate);
    };
  }, [getAllTasks]);

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
          icon: <Clock className="text-orange-400" size={18} />,
          color: "orange",
          tasks: myTasks.filter((task) => task.status === "todo"),
        },
        inProgress: {
          id: "inProgress",
          name: "In Progress",
          icon: <AlertCircle className="text-blue-400" size={18} />,
          color: "blue",
          tasks: myTasks.filter((task) => task.status === "inProgress"),
        },
        done: {
          id: "done",
          name: "Done",
          icon: <CheckCircle className="text-green-400" size={18} />,
          color: "green",
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
      const [movedTask] = sourceTasks.splice(result.source.index, 1);
      sourceTasks.splice(result.destination.index, 0, movedTask);

      setColumns({
        ...columns,
        [sourceCol.id]: { ...sourceCol, tasks: sourceTasks },
      });
    } else {
      const destCol = columns[result.destination.droppableId];
      const destTasks = [...destCol.tasks];
      const [movedTask] = sourceTasks.splice(result.source.index, 1);
      movedTask.status = result.destination.droppableId;

      destTasks.unshift(movedTask);

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
    const BACKEND_URL = "https://aesthetic-lorianna-teamsphere-b28ca5af.koyeb.app";
    
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
  
    window.addEventListener("message", function handler(event) {
      if (event.origin !== "http://localhost:3001") return;
      if (event.data.type === "zoom-auth-success") {
        console.log("Meeting Link:", event.data.meeting.join_url);
        const url = event.data.meeting.join_url;
        setMeetingURL(url);
      }
      window.removeEventListener("message", handler);
      popup.close();
    });
  }

  const getColumnColor = (color) => {
    const colors = {
      orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
      green: "from-green-500/20 to-green-600/20 border-green-500/30",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className=" bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="w-full h-screen flex gap-6 p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.values(columns).map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 max-w-sm bg-gradient-to-br from-gray-800/50 via-gray-700/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
                >
                  {/* Column Header */}
                  <div className={`p-4 bg-gradient-to-r ${getColumnColor(column.color)} border-b border-gray-700/50`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {column.icon}
                        <h3 className="font-semibold text-white text-lg">{column.name}</h3>
                        <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full">
                          {column.tasks.length}
                        </span>
                      </div>
                      <MoreHorizontal className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={16} />
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="p-4 space-y-3 min-h-[calc(100vh-200px)] overflow-y-auto">
                    {tasksLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-400">Loading tasks...</span>
                      </div>
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
                              className={`group cursor-pointer bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 border border-gray-600/50 hover:border-gray-500/50 rounded-xl p-4 transition-all duration-200 ${
                                snapshot.isDragging
                                  ? "scale-105 rotate-2 shadow-2xl border-blue-500/50 bg-blue-500/10"
                                  : "hover:shadow-lg"
                              }`}
                              onClick={() => setSelectedTaskGlobally(task)}
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                                  {task.title || "Untitled Task"}
                                </h4>
                                {task.description && (
                                  <p className="text-gray-400 text-sm line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                {task.assignedTo && (
                                  <div className="flex items-center gap-2 pt-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {task.assignedTo[0]?.toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-gray-400 text-xs">{task.assignedTo}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mb-3">
                          {column.icon}
                        </div>
                        <p className="text-sm">No tasks yet</p>
                        <p className="text-xs text-gray-600">Add your first task</p>
                      </div>
                    )}

                    {provided.placeholder}

                    {/* Add Task Button */}
                    <button
                      className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                        auth?.user?.role === "manager"
                          ? "bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white cursor-pointer"
                          : "bg-gray-800/30 border border-gray-700/50 text-gray-600 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (auth?.user?.role !== "manager") {
                          toast.error("Only managers can add tasks!");
                          return;
                        }
                        setModalOpen(true);
                      }}
                    >
                      <Plus size={16} />
                      <span className="text-sm">Add Task</span>
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>

        {/* Team Members Panel */}
        <div className="fixed bottom-6 right-6 z-50">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-600/25 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <Users size={18} />
              <span>Team Members</span>
            </button>
          )}

          {isOpen && (
            <div className="w-80 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
              {/* Panel Header */}
              <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-xl">
                      <Users className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Team Members</h3>
                      <p className="text-gray-400 text-sm">
                        {localTeam.filter(m => m.status === "online").length} online
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors duration-200 group"
                  >
                    <X size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Team Members List */}
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {localTeam && localTeam.length > 0 ? (
                  localTeam.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {member.name?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                            member.status === "online" ? "bg-green-500" : "bg-gray-500"
                          }`}></div>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{member.name}</p>
                          <p className="text-gray-400 text-xs">{member.email}</p>
                        </div>
                      </div>
                      {member.status === "online" && (
                        <button
                          onClick={() => authorizeZoom()}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors duration-200 group"
                        >
                          <Phone className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="text-gray-500" size={24} />
                    </div>
                    <p className="text-gray-400 text-sm">No team members</p>
                    <p className="text-gray-600 text-xs">Add team members to get started</p>
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
