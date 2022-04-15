const express = require("express");

const controller = require("../controller/controller");

const router = express.Router();

router.get("/films", controller.getFilms);

router.post("/favorites", controller.postFavorites);

router.get("/favorites", controller.getFavorites);

router.get("/favorites/:id", controller.getFavorite);

module.exports = router;
