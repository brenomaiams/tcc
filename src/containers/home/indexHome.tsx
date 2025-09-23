import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

import UserAvatar from "../../assets/logotcc.png";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false); 

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name || "Usuário");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendToAI = () => {
    if (!selectedFile) return;
    navigate("/resultado", { state: { file: selectedFile } });
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };

  const goToProfile = () => {
    navigate("/perfil");
    setShowProfileMenu(false); 
  };

  const capitalizeName = (name: string) => {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="welcome-text">Bem-vindo(a), {capitalizeName(userName)}!</h1>


        <div className="avatar-container">
          <img
            src={UserAvatar}
            alt="Avatar do usuário"
            className="avatar"
            onClick={toggleProfileMenu}
          />
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button className="dropdown-item" onClick={goToProfile}>
                Perfil
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="home-main">
       
        <section className="home-section">
          <h2>Enviar Foto para IA</h2>
          <label className="file-label">
            {selectedFile ? selectedFile.name : "Escolher arquivo"}
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>

          {selectedFile && (
            <button className="button send-button" onClick={handleSendToAI}>
              Enviar
            </button>
          )}
        </section>

        
        <section className="home-section">
          <h2>Histórico</h2>
          <button
            className="button history-button"
            onClick={() => navigate("/historico")}
          >
            Ver histórico
          </button>
        </section>
      </main>
    </div>
  );
};

export default Home;
