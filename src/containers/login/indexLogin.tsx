import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import LogoImg from "../../assets/logotcc.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email || !password) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao fazer login");
  }
};


  return (
    <div className="container">
      <div className="card">
        <img className="logo" src={LogoImg} alt="Logo do projeto" />
        <h1 className="title">Login</h1>
        <form onSubmit={handleSubmit}>
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
          <button className="button" type="submit">Entrar</button>
        </form>
        <p className="toggle-text">
          Não tem uma conta?{" "}
          <span onClick={() => navigate("/register")}>Registre-se</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
