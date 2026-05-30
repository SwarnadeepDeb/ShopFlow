const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, getNotification, markAsRead, deleteNotification } = require('../controllers/notificationController');

router.post('/', createNotification);
router.get('/', getNotifications);
router.get('/:id', getNotification);
router.put('/:id', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
