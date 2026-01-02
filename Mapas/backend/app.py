from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from flasgger import Swagger

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

def conexao_db():
    return mysql.connector.connect(
        host="db",
        port=3306,
        user="giovana",      
        password="mapas",      
        database="sistema_mapas"
    )
@app.route('/')
def home():
    return jsonify({
        "message": "Bem-vindo a API",
        "endpoints": {
            "mapas": "/api/mapas",
            "documentacao": "/apidocs"
        }
    })


@app.route('/api/mapas', methods=['GET'])
def get_mapas():
    """
    Listar todos os mapas
    ---
    responses:
      200:
        description: Uma lista de mapas com o total de pontos em cada um
    """
    conexao = conexao_db()
    cursor = conexao.cursor(dictionary=True)
    
    query = """
        SELECT m.id, m.nome, m.data_criacao, COUNT(p.id) as totalPontos 
        FROM mapas m 
        LEFT JOIN pontos p ON m.id = p.mapa_id 
        GROUP BY m.id
    """
    cursor.execute(query)
    mapas = cursor.fetchall()
    
    cursor.close()
    conexao.close()
    return jsonify(mapas)


@app.route('/api/mapas', methods=['POST'])
def create_mapa():
    """
    Criar um novo mapa
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            nome:
              type: string
              example: "Minha Viagem"
    responses:
      201:
        description: Mapa criado com sucesso
    """
    dados = request.json
    conexao = conexao_db()
    cursor = conexao.cursor()
    
    query = "INSERT INTO mapas (nome, data_criacao) VALUES (%s, NOW())"
    cursor.execute(query, (dados['nome'],))
    
    conexao.commit()
    novo_id = cursor.lastrowid
    
    cursor.close()
    conexao.close()
    return jsonify({"id": novo_id, "status": "sucesso"}), 201

@app.route('/api/mapas/<int:id>', methods=['GET'])
def get_mapa_detalhes(id):
    """
    Obter detalhes de um mapa específico e seus pontos
    ---
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Dados do mapa e lista de pontos associados
    """
    conexao = conexao_db()
    cursor = conexao.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM mapas WHERE id = %s", (id,))
    mapa = cursor.fetchone()
    
    cursor.execute("SELECT * FROM pontos WHERE mapa_id = %s", (id,))
    pontos = cursor.fetchall()
    
    cursor.close()
    conexao.close()
    return jsonify({"mapa": mapa, "pontos": pontos})

@app.route('/api/pontos', methods=['POST'])
def create_ponto():
    """
    Cadastrar um novo ponto geográfico
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            nome:
              type: string
            lat:
              type: number
            lng:
              type: number
            mapa_id:
              type: integer
    responses:
      201:
        description: Ponto criado com sucesso
    """
    dados = request.json
    conexao = conexao_db()
    cursor = conexao.cursor()
    
    query = "INSERT INTO pontos (nome, latitude, longitude, mapa_id) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (dados['nome'], dados['lat'], dados['lng'], dados['mapa_id']))
    
    conexao.commit()
    cursor.close()
    conexao.close()
    return jsonify({"status": "sucesso"}), 201

@app.route('/api/pontos/<int:id>', methods=['PUT'])
def update_ponto(id):
    """
    Atualizar o nome de um ponto existente
    ---
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          properties:
            nome:
              type: string
    responses:
      200:
        description: Ponto atualizado com sucesso
    """
    dados = request.json
    conexao = conexao_db()
    cursor = conexao.cursor()
    cursor.execute("UPDATE pontos SET nome = %s WHERE id = %s", (dados['nome'], id))
    conexao.commit()
    cursor.close()
    conexao.close()
    return jsonify({"status": "atualizado"})


@app.route('/api/pontos/<int:id>', methods=['DELETE'])
def delete_ponto(id):
    """
    Excluir um ponto específico
    ---
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Ponto excluído
    """
    conexao = conexao_db()
    cursor = conexao.cursor()
    cursor.execute("DELETE FROM pontos WHERE id = %s", (id,))
    conexao.commit()
    cursor.close()
    conexao.close()
    return jsonify({"status": "excluido"})

@app.route('/api/mapas/<int:mapa_id>/pontos', methods=['DELETE'])
def delete_todos_pontos(mapa_id):
    """
    Limpar todos os pontos de um mapa
    ---
    parameters:
      - name: mapa_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Todos os pontos do mapa foram removidos
    """
    conexao = conexao_db()
    cursor = conexao.cursor()
    cursor.execute("DELETE FROM pontos WHERE mapa_id = %s", (mapa_id,))
    conexao.commit()
    cursor.close()
    conexao.close()
    return jsonify({"status": "todos excluidos"})

if __name__ == '__main__':
    app.run(port=5026, debug=True)