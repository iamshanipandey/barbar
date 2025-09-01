require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');
const morgan = require('morgan');

const app = express();
connectDB();

// CORS configuration - yeh pehle karo
app.use(cors({
  origin: ['https://barber-hrzd.vercel.app', 'http://localhost:3000', 'https://queuecuts.in','www.queuecuts.in','https://www.queuecuts.in'], // Multiple origins allow kiye
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight requests handle karo
app.options('*', cors());

// Socket.io
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://barber-hrzd.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('joinQueueRoom', (shopId) => {
    socket.join(shopId);
  });
});

// Export io for use in controllers
module.exports.io = io;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Increase payload limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// index.js mein routes se pehle add kar
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/barber', require('./routes/barber'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/review', require('./routes/review'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
console.log('Trying to start server on port:', PORT);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
