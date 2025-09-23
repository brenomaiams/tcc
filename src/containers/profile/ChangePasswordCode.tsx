import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./passwordChange.css";

const ChangePasswordCode: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!code) {
      setError("Digite o código recebido no WhatsApp");
      return;
    }

    try {
      
      const phone = localStorage.getItem("phoneForPasswordChange");
      if (!phone) {
        setError("Telefone não encontrado. Reinicie o processo.");
        return;
      }

      const res = await fetch("http://localhost:3001/verify-password-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (res.ok) {
        
        navigate("/changepasswordnew");
      } else {
        setError(data.message || "Código inválido");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao validar código");
    }
  };

  return (
    <div className="password-change-container">
      <div className="password-change-card">
        <h1>Confirme seu código</h1>
        <p>Insira o código de 4 dígitos enviado para seu WhatsApp</p>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código"
          maxLength={4}
        />
        <button onClick={handleSubmit}>Confirmar Código</button>
      </div>
    </div>
  );
};

export default ChangePasswordCode;
