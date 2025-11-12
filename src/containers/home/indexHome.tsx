import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

import UserAvatar from "../../assets/logotcc.png";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name || "Usuário");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setResultado(null);
    }
  };

  const handleSendToAI = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/analisar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultado(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      alert("Erro ao enviar a imagem para análise.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);

    // Limpa os dados para permitir novo envio
    setSelectedFile(null);
    setPreviewImage(null);
    setResultado(null);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const goToProfile = () => {
    navigate("/perfil");
    setShowProfileMenu(false);
  };

  const capitalizeName = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="welcome-text">
          Bem-vindo(a), {capitalizeName(userName)}!
        </h1>

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
        {/* Upload para IA */}
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
            <button
              className="button send-button"
              onClick={handleSendToAI}
              disabled={loading}
            >
              {loading ? "Analisando..." : "Enviar"}
            </button>
          )}
        </section>

        {/* Histórico */}
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

      {/* Modal do resultado */}
      {showModal && resultado && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Resultado da Análise</h2>
            <p>
              <b>Praga identificada:</b> {resultado.classe}
            </p>
            <p>
              <b>Confiança:</b> {(resultado.confianca * 100).toFixed(2)}%
            </p>

            {previewImage && (
              <img
                src={previewImage}
                alt="Imagem enviada"
                className="modal-image"
              />
            )}

            <h3>Prevenção</h3>
            <p>{resultado.prevencao}</p>

            <h3>Combate</h3>
            <p>{resultado.combate}</p>

            <button className="button close-button" onClick={handleCloseModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
