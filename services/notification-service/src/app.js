// CI trigger check
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const notificationRoutes = require('./routes/notifications');
const { register, metricsMiddleware } = require('./metrics');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(metricsMiddleware);

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
