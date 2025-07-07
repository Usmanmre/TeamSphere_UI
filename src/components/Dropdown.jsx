import React, { useEffect, useState, useRef } from "react";
import { useBoard } from "../Global_State/BoardsContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Grid3X3, Check } from "lucide-react";
import { createPortal } from "react-dom";

const Dropdown = (props) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [myData, setmyData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuStyles, setMenuStyles] = useState({});
  const { setCurrentBoardGlobally } = useBoard();

  const handleChange = (board) => {
    setSelectedOption(board);
    setCurrentBoardGlobally(board);
    setIsOpen(false);
  };

  useEffect(() => {
    setmyData(props.myBoards || []);
  }, [props.myBoards]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Position the dropdown menu absolutely relative to the button
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyles({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  return (
    <div className="relative z-[9999]">
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3  bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-2 transition-all duration-200 group min-w-[200px]"
      >
        <div className="flex items-center gap-2 flex-1">
          <Grid3X3 className="text-blue-400" size={18} />
          <span className="text-white font-medium text-sm">
            {selectedOption ? selectedOption.title : "Select Board"}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-gray-400 group-hover:text-gray-300 transition-colors" size={16} />
        </motion.div>
      </button>

      {/* Dropdown Menu (Portaled) */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={menuStyles}
                className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-xl overflow-hidden z-[9999]"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="text-blue-400" size={16} />
                    <span className="text-gray-300 text-sm font-medium">Your Boards</span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {myData.length} board{myData.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="max-h-60 overflow-y-auto">
                  {myData.length > 0 ? (
                    myData.map((board, index) => (
                      <button
                        key={index}
                        onClick={() => handleChange(board)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group ${
                          selectedOption && selectedOption.title === board.title
                            ? "bg-blue-500/20 text-blue-300 border-l-2 border-blue-500"
                            : "text-gray-300 hover:bg-gray-700/50"
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="font-medium">{board.title}</span>
                        </div>
                        {selectedOption && selectedOption.title === board.title && (
                          <Check className="text-blue-400" size={16} />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Grid3X3 className="text-gray-500" size={24} />
                        <p className="text-gray-400 text-sm">No boards available</p>
                        <p className="text-gray-500 text-xs">Create a board to get started</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {myData.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-700/50 bg-gray-900/50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Click to select board</span>
                      <span className="text-blue-400 font-medium">
                        {selectedOption ? "Active" : "None selected"}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default Dropdown;
