// Importar dependências
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Para variáveis de ambiente

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
    const db = client.db('user'); // Banco de dados: users
    userCollection = db.collection('users'); // Coleção: user
    console.log('✅ Conectado ao MongoDB com driver nativo');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1); // Finaliza a aplicação se não conseguir conectar
  }
}

conectar();

// ========== ROTAS ==========

// POST /usuarios - Criar usuário
app.post('/usuarios', async (req, res) => {
  try {
    const usuario = req.body;
    const resultado = await userCollection.insertOne(usuario);
    res.status(201).json({ id: resultado.insertedId, ...usuario });
  } catch (err) {
    console.error('❌ Erro ao salvar usuário:', err);
    res.status(500).json({ erro: 'Erro ao salvar usuário', detalhes: err.message });
  }
});

// GET /usuarios - Listar todos ou filtrar
app.get('/usuarios', async (req, res) => {
  try {
    const query = {};

    if (req.query.name) query.name = req.query.name;
    if (req.query.email) query.email = req.query.email;
    if (req.query.age) query.age = parseInt(req.query.age);

    const usuarios = await userCollection.find(query).toArray();
    res.status(200).json(usuarios);
  } catch (err) {
    console.error('❌ Erro ao buscar usuários:', err);
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});

// PUT /usuarios/:id - Atualizar usuário
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await userCollection.updateOne(
      { _id: new MongoClient.ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao atualizar usuário:', err);
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
});

// DELETE /usuarios/:id - Deletar usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await userCollection.deleteOne({
      _id: new MongoClient.ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: '✅ Usuário deletado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao deletar usuário:', err);
    res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});