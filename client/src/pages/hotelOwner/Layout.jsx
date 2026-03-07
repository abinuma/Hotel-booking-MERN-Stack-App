import React from "react";
import Navbar from "../../components/hotelOwner/Navbar";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-[70vh]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 mb-50 pt-10 md:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
