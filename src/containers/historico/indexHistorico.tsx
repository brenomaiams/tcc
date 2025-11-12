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
  prevencao?: string;
  combate?: string;
}

const Historico: React.FC = () => {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/historico")
      .then((res) => {
         console.log("🔍 Dados recebidos do backend:", res.data);
        setHistorico(res.data);
        setLoading(false);
      })
      .catch((err) => {
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
        {historico.map((item) => {
          const imageUrl = `http://localhost:3001/${item.filepath.replace(/\\/g, "/")}`;


          return (
            <div key={item.id} className="historico-card">
              <img
                src={imageUrl}
                alt={item.filename}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src !== window.location.origin + "/placeholder.png") {
                    console.warn("Imagem não encontrada:", imageUrl);
                    img.src = "/placeholder.png";
                  }
                }}
              />

              <div className="historico-info">
                <p><strong>Praga:</strong> {item.classe}</p>
                <p><strong>Confiança:</strong> {(item.confianca * 100).toFixed(2)}%</p>
                <p><strong>Data:</strong> {new Date(item.created_at).toLocaleString()}</p>

                <div className="historico-prevencao">
                  <h4>Prevenção</h4>
                  <p>{item.prevencao || "Informação não disponível."}</p>
                </div>

                <div className="historico-combate">
                  <h4>Combate</h4>
                  <p>{item.combate || "Informação não disponível."}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Historico;
