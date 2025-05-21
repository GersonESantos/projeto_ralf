// Importar Express
const express = require('express');
const { engine } = require('express-handlebars');
const { MongoClient } = require('mongodb');
const cors = require('cors');

// Criar app
const app = express();

// Configuração do Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Servir arquivos estáticos como CSS, imagens etc.
app.use(express.static('public'));

// Middleware para JSON e CORS
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB
const client = new MongoClient(
  'mongodb+srv://gebhsantos:A3YG8lXShNUS7FUw@users.vnnwl.mongodb.net/users?retryWrites=true&w=majority&appName=users'
);
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

// Rota para criar produto (via API)
app.post('/api/produtos', async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const resultado = await produtosCollection.insertOne({ nome, preco });
    res.status(201).json({ id: resultado.insertedId, nome, preco });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar produto' });
  }
});

// Rota para listar produtos (via API)
app.get('/api/produtos', async (req, res) => {
  try {
    const produtos = await produtosCollection.find().toArray();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// Rota para exibir página com Handlebars
app.get('/', async (req, res) => {
  try {
    const produtos = await produtosCollection.find().toArray();
    res.render('home', { produtos });
  } catch (err) {
    res.status(500).send('Erro ao carregar página');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});