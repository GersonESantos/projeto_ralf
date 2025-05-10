// Importar dependências
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Para usar variáveis de ambiente (.env)

// Criar app
const app = express();
app.use(express.json());

// URI do MongoDB (recomenda-se colocar no .env)
const uri = process.env.MONGO_URI || 'mongodb+srv://gebhsantos:A3YG8lXShNUS7FUw@users.vnnwl.mongodb.net/users?retryWrites=true&w=majority&appName=users';

const client = new MongoClient(uri);
let userCollection;

async function conectar() {
  try {
    await client.connect();
    const db = client.db('users'); // Banco de dados: users
    userCollection = db.collection('user'); // Coleção: user
    console.log('Conectado ao MongoDB com driver nativo');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1); // Finaliza a aplicação se não conseguir conectar
  }
}

conectar();

// Rota POST - Cadastrar usuário
app.post('/', async (req, res) => {
  try {
    const usuario = req.body;
    const resultado = await userCollection.insertOne(usuario);
    res.status(201).json({ id: resultado.insertedId, ...usuario });
  } catch (err) {
    console.error('Erro ao salvar usuário:', err);
    res.status(500).json({ erro: 'Erro ao salvar usuário', detalhes: err.message });
  }
});

// Rota GET - Listar todos os usuários
app.get('/', async (req, res) => {
  try {
    const usuarios = await userCollection.find().toArray();
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});