const router = require('express').Router();
const ChatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/inbox', authMiddleware, ChatController.getInboxUsers);
router.get('/unread/:id', authMiddleware, ChatController.getUnReadMessages);
router.get('/:userId', authMiddleware, ChatController.getMessages);

module.exports = router;
