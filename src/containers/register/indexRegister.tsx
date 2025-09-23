import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import LogoImg from "../../assets/logotcc.png";

const Register: React.FC = () => {
  const [name, setName] = useState<string>(""); 
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !phone) {
      alert("Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }) 
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        navigate("/login"); 
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar usuário");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img className="logo" src={LogoImg} alt="Logo do projeto" />
        <h1 className="title">Registro</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Confirme a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <input
            className="input"
            type="tel"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="button" type="submit">Registrar</button>
        </form>
        <p className="toggle-text">
          Já tem uma conta?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
