
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import crypto from "crypto";
import whatsappClient from "./whatsapp.js";


const app = express();
const port = 3001;





app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "tccpraga"
});

db.connect(err => {
  if (err) throw err;
  console.log("Conectado ao MySQL!");
});

// -------------------- REGISTRO --------------------
app.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "Preencha todos os campos!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, phone], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email ou telefone já cadastrado!" });
        }
        return res.status(500).json({ message: "Erro no servidor" });
      }
      res.json({ message: "Usuário registrado com sucesso!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
});

// -------------------- LOGIN --------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Preencha todos os campos!" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" });
    if (results.length === 0) return res.status(400).json({ message: "Email não encontrado!" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Senha incorreta!" });

    res.json({ message: "Login realizado com sucesso!", user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  });
});

// -------------------- ATUALIZAR DADOS --------------------
app.put("/update-user", async (req, res) => {
  const { email, field, value, password } = req.body;

  if (!email || !field || !value || !password) {
    return res.status(400).json({ message: "Dados incompletos!" });
  }

  // Verifica senha
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" });
    if (results.length === 0) return res.status(400).json({ message: "Usuário não encontrado" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Senha incorreta!" });

    // Atualiza campo
    db.query(`UPDATE users SET ${field} = ? WHERE email = ?`, [value, email], (err2) => {
      if (err2) return res.status(500).json({ message: "Erro ao atualizar" });
      res.json({ message: `${field} atualizado com sucesso!` });
    });
  });
});

// -------------------- SOLICITAR CÓDIGO PARA ALTERAR SENHA --------------------
app.post("/request-password-code", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Telefone é obrigatório" });

  const code = Math.floor(1000 + Math.random() * 9000).toString();

 
  let digits = phone.replace(/\D/g, "");

  
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }

  db.query(
    "UPDATE users SET sms_code = ? WHERE REPLACE(phone, '\\D', '') LIKE ?",
    [code, `%${digits.slice(-11)}`],   
    async (err) => {
      if (err) return res.status(500).json({ message: "Erro no servidor" });

      console.log(`Código enviado para ${digits}: ${code}`);

      try {
        const numeroFormatado = `${digits}@c.us`;  
        await whatsappClient.sendMessage(numeroFormatado, `🔐 Seu código de verificação é: ${code}`);
        res.json({ message: "Código enviado com sucesso via WhatsApp!" });
      } catch (wppErr) {
        console.error("Erro ao enviar WhatsApp:", wppErr);
        res.status(500).json({ message: "Erro ao enviar WhatsApp" });
      }
    }
  );
});









// -------------------- VERIFICAÇÃO DO CÓDIGO --------------------
app.post("/verify-password-code", (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: "Dados incompletos" });

  db.query("SELECT sms_code FROM users WHERE phone = ?", [phone], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" });
    if (results.length === 0) return res.status(400).json({ message: "Telefone não cadastrado" });

    const user = results[0];
    if (user.sms_code !== code) return res.status(400).json({ message: "Código incorreto" });

    
    res.json({ message: "Código válido" });
  });
});



// -------------------- ALTERAR SENHA --------------------
app.put("/update-password-by-phone", async (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword) return res.status(400).json({ message: "Dados incompletos" });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password = ?, sms_code = NULL WHERE phone = ?",
      [hashedPassword, phone],
      (err) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar senha" });
        res.json({ message: "Senha alterada com sucesso!" });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno" });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
