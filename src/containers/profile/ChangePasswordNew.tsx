import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./passwordChange.css";

const ChangePasswordNew: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      const phone = localStorage.getItem("phoneForPasswordChange");
      if (!phone) {
        setError("Telefone não encontrado. Reinicie o processo.");
        return;
      }

      const res = await fetch("http://localhost:3001/update-password-by-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Senha alterada com sucesso!");
        navigate("/login"); 
      } else {
        setError(data.message || "Erro ao alterar senha");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao alterar senha");
    }
  };

  return (
    <div className="password-change-container">
      <div className="password-change-card">
        <h1>Defina sua nova senha</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nova senha"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirme a senha"
        />
        <button onClick={handleSubmit}>Alterar Senha</button>
      </div>
    </div>
  );
};

export default ChangePasswordNew;
