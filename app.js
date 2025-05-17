// Importar Express
require('express');

// Criar uma constante do Express
const express = require('express');

// Importar MongoDB e adicionar em uma constante
const { MongoClient } = require('mongodb');
const cors = require('cors');
// Criar app
const app = express();
app.use(express.json());

app.use(cors());
// Conexão com o MongoDB Atlas - URI diretamente no código
const client = new MongoClient('mongodb+srv://gebhsantos:A3YG8lXShNUS7FUw@users.vnnwl.mongodb.net/users?retryWrites=true&w=majority&appName=users');
let produtosCollection;

async function conectar() {
  try {
    await client.connect();
    const db = client.db('produtosDB');
    produtosCollection = db.collection('produtos');
    console.log('Conectado ao MongoDB com driver nativo');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
  }
}

conectar();

// Rota para criar um novo produto
app.post('/', async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const resultado = await produtosCollection.insertOne({ nome, preco });
    res.status(201).json({ id: resultado.insertedId, nome, preco });
  } catch (err) {
    console.error('Erro ao salvar produto:', err);
res.status(500).json({ erro: 'Erro ao salvar produto', detalhes: err.message });
  }
});

// Rota para listar todos os produtos
app.get('/', async (req, res) => {
  try {
    const produtos = await produtosCollection.find().toArray();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// Iniciar o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
