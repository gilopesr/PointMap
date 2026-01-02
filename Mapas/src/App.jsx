import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://localhost:5026/api';

const api = async (endpoint, method = 'GET', body = null) => {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) config.body = JSON.stringify(body);
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  return response.json();
};

//  TELA 1
const TelaListagem = () => {
  const [mapas, setMapas] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const navigate = useNavigate();

  const carregarMapas = async () => {
    try {
      const dados = await api('/mapas');
      setMapas(dados);
    } catch (err) { console.error("Erro ao carregar:", err); }
  };

  useEffect(() => { carregarMapas(); }, []);

  const criarMapa = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    await api('/mapas', 'POST', { nome: novoNome });
    setNovoNome('');
    carregarMapas();
  };

  return (
    <div className="container-center">
      <header className="main-header">
        <h1>Mapas</h1>
        <p className="text-secondary">Crie um mapa e adicione lugares!</p>
      </header>

      <section className="create-section">
        <form onSubmit={criarMapa} className="flex-gap">
          <input 
            className="input-field no-margin"
            value={novoNome} 
            onChange={(e) => setNovoNome(e.target.value)} 
            placeholder="Ex: Museus em SP, Restaurantes..." 
          />
          <button type="submit" className="btn btn-primary"> + Novo Mapa </button>
        </form>
      </section>

      <div className="card-grid">
        {mapas.map(m => (
          <div key={m.id} className="map-card">
            <div>
              <h3>{m.nome}</h3>
              <div className="map-card-info"> Criado em: {new Date(m.data_criacao).toLocaleDateString()} </div>
            </div>
            <div className="map-card-footer">
              <span className="badge-count"> {m.totalPontos} {m.totalPontos === 1 ? 'ponto' : 'pontos'} </span>
              <button onClick={() => navigate(`/mapa/${m.id}`)} className="btn btn-primary btn-sm"> Abrir Mapa </button>
            </div>
          </div>
        ))}
        {mapas.length === 0 && <div className="empty-message">Nenhum mapa encontrado.</div>}
      </div>
    </div>
  );
};

// TELA 2
const TelaMapa = () => {
  const { id } = useParams();
  const [mapa, setMapa] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [novoPonto, setNovoPonto] = useState({ nome: '', lat: '', lng: '' });

  const carregarDados = async () => {
    const data = await api(`/mapas/${id}`);
    setMapa(data.mapa);
    setPontos(data.pontos);
  };

  useEffect(() => { carregarDados(); }, [id]);

  const handleSavePonto = async () => {
    await api('/pontos', 'POST', { ...novoPonto, mapa_id: id });
    setShowModal(false);
    setNovoPonto({ nome: '', lat: '', lng: '' });
    carregarDados();
  };

  const handleEditNome = async (idPonto, nomeAtual) => {
    const novoNome = prompt("Novo nome do ponto:", nomeAtual);
    if (novoNome && novoNome !== nomeAtual) {
      await api(`/pontos/${idPonto}`, 'PUT', { nome: novoNome });
      carregarDados();
    }
  };

  const handleDeletePonto = async (idPonto) => {
    if (window.confirm("Excluir este ponto?")) {
      await api(`/pontos/${idPonto}`, 'DELETE');
      carregarDados();
    }
  };

  const handleDeleteTodos = async () => {
    if (window.confirm("Excluir TODOS os pontos deste mapa?")) {
      await api(`/mapas/${id}/pontos`, 'DELETE');
      carregarDados();
    }
  };

  const ManipuladorClique = () => {
    useMapEvents({
      click: (e) => {
        setNovoPonto({ nome: '', lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) });
        setShowModal(true);
      },
    });
    return null;
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="flex-align">
          <Link to="/" className="btn-back">← Voltar</Link>
          <span className="map-title">{mapa?.nome}</span>
        </div>
        <div className="flex-align gap-20">
          <span className="badge">📍 {pontos.length} Pontos</span>
          <button onClick={handleDeleteTodos} className="btn btn-outline-danger">Limpar Mapa</button>
        </div>
      </header>

      <main className="main-content">
        <div className="map-wrapper">
          <MapContainer center={[-23.55, -46.63]} zoom={12} style={{ height: '100%', width: '100%', minHeight: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pontos.map(p => (
              <Marker key={p.id} position={[p.latitude, p.longitude]}>
                <Popup>{p.nome}</Popup>
              </Marker>
            ))}
            <ManipuladorClique />
          </MapContainer>
        </div>

        <aside className="sidebar">
          <h2>Pontos no Mapa</h2>
          {pontos.length === 0 && <p className="text-secondary">Clique no mapa para adicionar pontos.</p>}
          {pontos.map(p => (
            <div key={p.id} className="point-card">
              <div>
                <div className="point-name">{p.nome}</div>
                <div className="point-coords">{p.latitude}, {p.longitude}</div>
              </div>
              <div className="flex-gap-8">
                <button onClick={() => handleEditNome(p.id, p.nome)} className="btn-icon">✏️</button>
                <button onClick={() => handleDeletePonto(p.id)} className="btn-icon btn-delete">🗑️</button>
              </div>
            </div>
          ))}
        </aside>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Novo Ponto</h3>
            <p className="text-secondary small">De um nome para o ponto</p>
            <input 
              className="input-field" autoFocus
              value={novoPonto.nome} 
              onChange={e => setNovoPonto({...novoPonto, nome: e.target.value})} 
            />
            <div className="modal-actions">
              <button onClick={handleSavePonto} className="btn btn-primary flex-1">Salvar</button>
              <button onClick={() => setShowModal(false)} className="btn btn-light flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaListagem />} />
        <Route path="/mapa/:id" element={<TelaMapa />} />
      </Routes>
    </Router>
  );
}