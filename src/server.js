const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const connectDB = require('./config/db');
const setupSocket = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

connectDB();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.redirect('/chats');
});

app.get('/chats', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/chats.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.use((req, res) => {
    res.status(404).redirect('/login');
});

setupSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 