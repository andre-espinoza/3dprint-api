var express = require("express");
var router = express.Router();

const product_controller = require("../controllers/productController");

/* GET users listing. */
router.get("/", product_controller.product_list);

router.get("/schema", product_controller.product_schema);

router.post("/", product_controller.product_create);

router.delete("/:id", product_controller.product_delete);

router.put("/:id", product_controller.product_update);

module.exports = router;
