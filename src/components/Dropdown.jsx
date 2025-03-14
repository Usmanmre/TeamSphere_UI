import React, { useEffect, useState } from "react";
import { MenuItem, Select, FormControl, InputLabel, Box } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useBoard } from "../Global_State/BoardsContext";
import { motion, AnimatePresence } from "framer-motion";

const Dropdown = (props) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [myData, setmyData] = useState([]);
  const {setCurrentBoardGlobally} = useBoard()

  const handleChange = (event) => {
    const newValue = event.target.value
    setSelectedOption(newValue);
    setCurrentBoardGlobally(newValue)

  };

  useEffect(() => {
    setmyData(props.myBoards || []); // Ensure default value is an array

  }, [props.myBoards]);

  return (

   
          

<FormControl fullWidth sx={{ maxWidth: 200 }}>
  <InputLabel
    id="dropdown-label"
    sx={{
      color: "#fff",
    }}
  >
    Your Boards
  </InputLabel>
  <Select
    labelId="dropdown-label"
    id="dropdown"
    value={selectedOption}
    onChange={handleChange}
    sx={{
      background: "linear-gradient(135deg, #1E1E1E 0%, #292929 100%)", 
      borderRadius: "10px",
      color: "#fff",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
      backdropFilter: "blur(10px)",
      "&:hover": {
        background: "linear-gradient(135deg, #292929 0%, #3A3A3A 100%)",
      },
      "&.Mui-focused": {
        background: "linear-gradient(135deg, #323232 0%, #454545 100%)",
        boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.25)",
      },
    }}
  >
    {myData.length > 0 ? (
      myData.map((board, index) => (
        <MenuItem
          key={index}
          value={board}
          sx={{
            "&:hover": {
              backgroundColor: "#505050",
              color: "#fff",
            },
            borderRadius: "2px",
          }}
        >
          {board.title}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>No boards available</MenuItem>
    )}
  </Select>
</FormControl>

  
  );
};

export default Dropdown;
