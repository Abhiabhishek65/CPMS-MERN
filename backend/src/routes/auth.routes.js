const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");

router.post("/student/signup", ctrl.studentSignup);
router.post("/student/login", ctrl.studentLogin);
router.post("/student/forgot-password", ctrl.studentForgotPassword);

router.post("/tpo/signup", ctrl.tpoSignup);
router.post("/tpo/login", ctrl.tpoLogin);

module.exports = router;
