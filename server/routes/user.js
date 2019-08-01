var express = require('express');
const SALT_WORK_FACTOR = 10;
var router = express.Router();
var userController = require('./../controller/user.controller');
var auth = require('./auth');
/* GET users listing. */
router.post('/signup',userController.addUser);
router.post('/login',userController.logIn);
router.put('/update-details/:userId', userController.updateUserById);

// router.get('/get-logs/:userId', userController.getUserWorkLogs);
// router.put('/change-profile/:id', userController.changeProfileByUserId);
// router.get('/get-logs/:userId', userController.getUserWorkLogs);
router.get('/get-all-developers', userController.getAllUsers);
router.get('/get-all-project-manager', userController.getAllProjectManager);

router.put('/reset-password',userController.resetPassword);
// router.post('/send-email',userController.sendEmail);

// router.get('/get-logs/:userId', userController.getUserWorkLogs);
// router.get('/get-all-developers', userController.getAllUsers);
router.post('/get-all-developers-by-project-manager', userController.getAllUsersByProjectManager);
router.put('/change-profile/:id', userController.changeProfileByUserId);

router.get('/get-user-by-id/:userId',userController.getSingleUser);
router.get('/get-user-not-in-project-team/:projectId',userController.getDevelpoersNotInProjectTeam);
router.get('/get-project-mngr-not-in-project-team/:projectId',userController.getProjectMngrNotInProject);
router.put('/forgot-password',userController.forgotPassword);
router.put('/update-password',userController.updatePassword);
router.put('/delete-user/:userId',userController.deleteUserById);

// router.post('/signup_without_file',userController.addUser_without_file);
module.exports = router;