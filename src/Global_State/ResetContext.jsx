// Global_State/ResetContext.js
import { createContext, useContext } from "react";

export const ResetContext = createContext();

export const useAppReset = () => {
  return useContext(ResetContext);
};
