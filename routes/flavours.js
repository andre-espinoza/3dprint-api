var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");
const Flavour = require("../models/flavour");
const { body, validationResult } = require("express-validator");

const flavour_controller = require("../controllers/flavourController");

/* GET users listing. */
router.get("/", flavour_controller.flavour_list);

router.get("/schema", flavour_controller.flavour_schema);

router.post("/", flavour_controller.flavour_create);

router.delete("/:id", flavour_controller.flavour_delete);

router.put("/:id", flavour_controller.flavour_update);

module.exports = router;
