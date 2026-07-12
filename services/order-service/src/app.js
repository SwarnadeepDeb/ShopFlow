// CI trigger check
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const orderRoutes = require('./routes/orders');
const { register, metricsMiddleware } = require('./metrics');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(metricsMiddleware);

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
