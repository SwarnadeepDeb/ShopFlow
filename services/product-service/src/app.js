// CI trigger check 2
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const productRoutes = require('./routes/products');
const { register, metricsMiddleware } = require('./metrics');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(metricsMiddleware);

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
