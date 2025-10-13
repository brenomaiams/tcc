import React, { useEffect, useState } from "react";
import axios from "axios";
import "./historico.css";

interface HistoricoItem {
  id: number;
  filename: string;
  filepath: string;
  classe: string;
  confianca: number;
  created_at: string;
}

const Historico: React.FC = () => {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/historico") // rota do backend
      .then(res => {
        setHistorico(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar histórico:", err);
        setError("Não foi possível carregar o histórico.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregando histórico...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="historico-container">
      <h2>Histórico de Análises</h2>
      {historico.length === 0 && <p>Nenhuma análise realizada ainda.</p>}
      <div className="historico-list">
        {historico.map(item => (
          <div key={item.id} className="historico-card">
            <img
                 src={`http://localhost:3001/uploads/historico/${item.filepath}`}
                 alt={item.filename}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png"; // imagem padrão se não carregar
              }}
            />
            <div className="historico-info">
              <p><strong>Classe:</strong> {item.classe}</p>
              <p><strong>Confiança:</strong> {(item.confianca * 100).toFixed(2)}%</p>
              <p><strong>Data:</strong> {new Date(item.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Historico;
