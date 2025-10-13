
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./containers/login/indexLogin";
import Register from "./containers/register/indexRegister";
import Home from "./containers/home/indexHome";
import Profile from "./containers/profile/indexProfile";
import Historico from "./containers/historico/indexHistorico";



import ChangePasswordCode from "./containers/profile/ChangePasswordCode";
import ChangePasswordNew from "./containers/profile/ChangePasswordNew";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/perfil" element={<Profile/>} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/changepasswordcode" element={<ChangePasswordCode/>} />
        <Route path="/changepasswordnew" element={<ChangePasswordNew/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
