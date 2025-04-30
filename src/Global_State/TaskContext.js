import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useBoard } from "../Global_State/BoardsContext";
import BASE_URL from "../config";
import { getUsernameFromEmail } from "../helper";

const TasksContext = new createContext();

// Auth Provider Component
export const TasksProvider = ({ children = null }) => {
  const [myTasks, setMyTasks] = useState([]);
  const [mySelectedTask, setSelectedTask] = useState();
  const [tasksLoading, setTasksLoading] = useState(false);
  const [myTeam, setMyTeam] = useState([]);
  const { currentBoard } = useBoard();
  const mySelectedTaskRef = useRef(null);

  useEffect(() => {
    mySelectedTaskRef.current = mySelectedTask;
  }, [mySelectedTask]);

  const getAllTasks = async () => {
    if (!currentBoard?.boardID) {
      return;
    } else {
      try {
        setTasksLoading(true);
        const boardID = currentBoard.boardID;
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (!token) {
          console.error("No token found. Please log in.");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/api/task/all?boardID=${boardID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`, // Attach the token to the request
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error getting tashs:", errorData);
          return;
        }
        const result = await response.json();
        setMyTasks(result); // Set fetched boards
        setTasksLoading(false);
      } catch (err) {
        console.error("Error fetching boards:", err);
      }
    }
  };

  const getTeam = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in.");

    try {
      const response = await fetch(`${BASE_URL}/api/auth/getTeam`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (response.ok) {
        const team = await response.json();

        // Map and wait for all usernames to be resolved
        const enrichedTeam = await Promise.all(
          team.map(async (member) => {
            const name = await getUsernameFromEmail(member.email); // assuming member has email
            return { ...member, name };
          })
        );

        setMyTeam(enrichedTeam);
      } else {
        console.error("Failed to fetch team");
      }
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  };

  const resetTasks = () => {
    setSelectedTask(null);
    setMyTasks([]);
  };

  const selectedTaskGlobal = (task) => {
    setSelectedTask(task);
  };

  const selectedTaskGlobalUpdate = (desc) => {
    const currentTask = mySelectedTaskRef.current;
    console.log("Updating task based on ref", currentTask);

    if (!currentTask) {
      console.warn("Trying to update task, but none is selected.");
      return;
    }
    const updated = { ...currentTask, description: desc };
    setSelectedTask(updated);
  };

  return (
    <TasksContext.Provider
      value={{
        getAllTasks,
        myTasks,
        tasksLoading,
        selectedTaskGlobal,
        mySelectedTask,
        selectedTaskGlobalUpdate,
        getTeam,
        myTeam,
        resetTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);
