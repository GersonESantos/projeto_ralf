const express = require('express');
const { engine } = require('express-handlebars');

const { MongoClient, ObjectId } = require('mongodb');

const multer = require('multer');
const path = require('path');
const app = express();
const hbs = require('express-handlebars');
/// Config Handlebars com helper de formatação de preço
const handlebars = hbs.create({
  helpers: {
    formatarPreco(valor) {
      return (valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  }
});

app.engine('handlebars', handlebars.engine); // ✅ Usando a instância correta
app.set('view engine', 'handlebars');
app.set('views', './views');

// Pasta pública (Bootstrap + uploads)
app.use(express.static('public'));

// Middleware para formulários e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Upload de imagem - Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Conexão MongoDB
const client = new MongoClient(
  'mongodb+srv://gebhsantos:A3YG8lXShNUS7FUw@users.vnnwl.mongodb.net/users?retryWrites=true&w=majority&appName=users'
);
let produtosCollection;

async function conectar() {
  try {
    await client.connect();
    const db = client.db('produtosDB');
    produtosCollection = db.collection('produtos');
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
  }
}

conectar();

// Rota principal - Lista produtos e form
app.get('/', async (req, res) => {
  try {
    const produtos = await produtosCollection.find().toArray();
    res.render('home', { produtos });
  } catch (err) {
    res.status(500).send('Erro ao carregar página');
  }
});

// Rota para cadastrar produto
app.post('/produtos', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const precoFormatado = parseInt(preco, 10);

    if (!nome || isNaN(precoFormatado)) {
      return res.status(400).send('Dados inválidos');
    }

    const produto = {
      nome,
      preco: precoFormatado,
      imagem: req.file ? `/uploads/${req.file.filename}` : null
    };

    await produtosCollection.insertOne(produto);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar produto');
  }
});

// Busca com filtro
app.get('/buscar', async (req, res) => {
  try {
    const { q } = req.query;
    const query = q ? { nome: new RegExp(q, 'i') } : {};
    const produtos = await produtosCollection.find(query).toArray();
    res.render('home', { produtos, busca: q });
  } catch (err) {
    res.status(500).send('Erro na busca');
  }
});
// Rota para excluir produto
app.post('/produtos/excluir/:id', async (req, res) => {
  const { id } = req.params;

  try {
   await produtosCollection.deleteOne({ _id: new ObjectId(id) });

    res.redirect('/'); // Volta pra página inicial
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    res.status(500).send('Erro ao excluir produto');
  }
});

// Rota para carregar formulário de edição
app.get('/produtos/editar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await produtosCollection.findOne({ _id: new ObjectId(id) });

    if (!produto) {
      return res.status(404).send('Produto não encontrado');
    }

    res.render('editar', { produto });
  } catch (err) {
    console.error('Erro ao carregar produto:', err);
    res.status(500).send('Erro ao carregar produto');
  }
});

// Rota para atualizar produto
app.post('/produtos/editar/:id', upload.single('imagem'), async (req, res) => {
  const { id } = req.params;
  const { nome, preco } = req.body;
  const precoFormatado = parseInt(preco, 10);

  if (!nome || isNaN(precoFormatado)) {
    return res.status(400).send('Dados inválidos');
  }

  try {
    const updateData = { nome, preco: precoFormatado };

    // Se houver nova imagem, atualiza
    if (req.file) {
      updateData.imagem = `/uploads/${req.file.filename}`;
    }

    await produtosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.redirect('/');
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).send('Erro ao atualizar produto');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});