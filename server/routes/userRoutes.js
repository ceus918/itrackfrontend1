const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/getUsers', userController.getUsers);
router.delete('/deleteUser/:id', userController.deleteUser);
router.post('/createUser', userController.createUser);
router.put('/updateUser/:id', userController.updateUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/send-reset-links', userController.sendResetLinksToAll);

module.exports = router;


