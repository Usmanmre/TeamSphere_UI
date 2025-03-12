import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Board from "./Board";
// import emailjs from '@emailjs/browser';

const TrelloBoard = () => {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col   w-full">
        <div className="">
          <Navbar />
        </div>
        <div className="h-full bg-slate-800">
          <Board />
        </div>
      </div>
    </div>
  );
};

export default TrelloBoard;
