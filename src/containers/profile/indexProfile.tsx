import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; phone?: string }>({
    name: "",
    email: "",
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleEditClick = (field: string) => {
    if (field === "password") {
      setShowPhoneModal(true); 
    } else {
      setEditingField(field);
      setNewValue(user[field as keyof typeof user] || "");
    }
  };

  const handleSaveField = async (field: string) => {
    try {
      const res = await fetch("http://localhost:3001/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value: newValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, [field]: newValue }));
        setEditingField(null);
        alert("Atualizado com sucesso!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar");
    }
  };

const handlePhoneModalSubmit = async () => {
  if (!phone) return alert("Digite seu telefone");

  try {
    const res = await fetch("http://localhost:3001/request-password-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    if (!res.ok) {
      return alert(data.message || "Erro ao enviar código");
    }

    
    localStorage.setItem("phoneForPasswordChange", phone);

    alert("Código enviado por SMS!");
    setShowPhoneModal(false);

    navigate("/changepasswordcode");
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar SMS");
  }
};


  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Perfil</h1>

        <div className="profile-field">
          <label>Nome:</label>
          {editingField === "name" ? (
            <>
              <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
              <button onClick={() => handleSaveField("name")}>Salvar</button>
              <button onClick={() => setEditingField(null)}>Cancelar</button>
            </>
          ) : (
            <>
              <span>{user.name}</span>
              <button onClick={() => handleEditClick("name")}>✏️</button>
            </>
          )}
        </div>

        <div className="profile-field">
          <label>Email:</label>
          {editingField === "email" ? (
            <>
              <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
              <button onClick={() => handleSaveField("email")}>Salvar</button>
              <button onClick={() => setEditingField(null)}>Cancelar</button>
            </>
          ) : (
            <>
              <span>{user.email}</span>
              <button onClick={() => handleEditClick("email")}>✏️</button>
            </>
          )}
        </div>

        <div className="profile-field">
          <label>Senha:</label>
          <span>********</span>
          <button onClick={() => handleEditClick("password")}>✏️</button>
        </div>
      </div>

      
      {showPhoneModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirme seu telefone</h2>
            <input
              type="text"
              placeholder="Digite seu telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handlePhoneModalSubmit}>Enviar Código</button>
              <button onClick={() => setShowPhoneModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
