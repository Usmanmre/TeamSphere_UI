import React, { useEffect, useState } from "react";
import { MenuItem, Select, FormControl, InputLabel, Box } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useBoard } from "../Global_State/BoardsContext";

const Dropdown = (props) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [myData, setmyData] = useState([]);
  const {setCurrentBoardGlobally} = useBoard()

  const handleChange = (event) => {
    const newValue = event.target.value
    console.log('handleChange im', newValue)
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
          color: "white",
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
          backgroundColor: blue[500], // Material-UI color
          borderRadius: "8px",
        }}
      >
        {myData.length > 0 ? (
          myData.map((board, index) => (
            <MenuItem
              key={index}
              value={board}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
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
