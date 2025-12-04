const express = require("express");
const router = express.Router();
const { suscribir } = require("../controllers/suscripcionController");

router.post("/suscribir", suscribir);

module.exports = router;
