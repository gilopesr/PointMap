# 📍 PointMap 
PointMap é uma aplicação interativa que permite aos usuários criar pontos de localização em mapas personalizados. Você pode criar diferentes mapas (ex: "Roteiro de Viagem", "Meus Restaurantes Favoritos") e cadastrar pontos clicando diretamente no mapa.

## ⚙️Tecnologias utilizadas
- Frontend: React.js, Vite, React Leaflet (OpenStreetMap), React Router
- Backend: Python, Flask, Flasgger (Documentação Swagger)
- Banco de Dados: MySQL
- Infraestrutura: Docker e Docker Compose

## 🚀 API Endpoints

### Mapas
| Método | Rota | Descrição | Parâmetros (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/mapas` | Lista todos os mapas e total de pontos | - |
| **POST** | `/api/mapas` | Cria um novo mapa | `{"nome": "string"}` |
| **GET** | `/api/mapas/<id>` | Busca detalhes e pontos de um mapa | - |
| **DELETE** | `/api/mapas/<id>/pontos` | Exclui todos os pontos de um mapa | - |

### Pontos
| Método | Rota | Descrição | Parâmetros (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/pontos` | Cadastra um ponto no mapa | `{"nome", "lat", "lng", "mapa_id"}` |
| **PUT** | `/api/pontos/<id>` | Edita o nome de um ponto | `{"nome": "string"}` |
| **DELETE** | `/api/pontos/<id>` | Remove um ponto específico | - |

## 📥 Para Executar o Projeto
**1. clone o repositorio**
```bash
  git clone https://github.com/seu-usuario/pointmap.git
  cd pointmap/mapas
```
**2. inicie o container**
```bash
   docker-compose up --build
```
**3. acesse os endpoints**
```bash
   Frontend: http://localhost:5173
   Backend (API): http://localhost:5026/api
   Documentação Swagger: http://localhost:5026/apidocs
```
