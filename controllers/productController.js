const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const he = require("he");
function getBearerHeaderToSetTokenStringOnReq(req, res, next) {
  const bearerHeader = req.headers?.authorization;
  if (typeof bearerHeader !== "undefined") {
    //bearer header format : Bearer <token>

    const bearer = bearerHeader.split(" ");

    const bearerToken = bearer[1];

    req.token = bearerToken;
    next();
  } else {
    next();
  }
}

exports.product_create = [
  getBearerHeaderToSetTokenStringOnReq,
  // Validate body and sanitize fields.
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "category must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("createdTime").isISO8601().withMessage("Date must be a valid date"),
  body("image1", "image1 must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("image2").optional().trim().escape(),
  body("image3").optional().trim().escape(),
  body("image4").optional().trim().escape(),
  body("image5").optional().trim().escape(),

  // Process request after validation and sanitization.

  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    console.log(`errors :${JSON.stringify(errors)}`);
    // Create a BookInstance object with escaped and trimmed data.git
    console.log(`body content is:${JSON.stringify(req.body)}`);

    const product = new Product({
      name: he.decode(req.body.name),
      category: he.decode(req.body.category),
      createdTime: req.body.createdTime,
      image1: he.decode(req.body.image1),
      image2: req.body.image2 ? he.decode(req.body.image2) : undefined,
      image3: req.body.image3 ? he.decode(req.body.image3) : undefined,
      image4: req.body.image4 ? he.decode(req.body.image4) : undefined,
      image5: req.body.image5 ? he.decode(req.body.image5) : undefined,
    });

    if (!errors.isEmpty()) {
      // There are errors.

      res.status(422).json({ error: "Validation failed" });
      return;
    } else {
      try {
        // Data from form is valid
        jwt.verify(req.token, "secretkey");
        await product.save();
        res.status(200).json({ product });
      } catch (err) {
        console.log(err);
      }
    }
  },
];

exports.product_list = asyncHandler(async (req, res, next) => {
  const products = await Product.find().sort({ name: -1 }).exec();

  console.log(`response is ${JSON.stringify(products)}`);
  console.log(`first`);
  res.json(products);
});

exports.product_schema = asyncHandler(async (req, res, next) => {
  //
  const schema = Product.schema.paths;
  const schemaDetails = Object.keys(schema)
    .filter((key) => !key.startsWith("_")) // Filter out keys starting with '_'
    .map((key) => {
      return {
        key: key,
        type: schema[key].instance,
        required: schema[key].isRequired ? true : false,
      };
    });
  console.log(`schema is ${JSON.stringify(schemaDetails)}`);
  //
  res.json(schemaDetails);
});

exports.product_update = [
  getBearerHeaderToSetTokenStringOnReq,
  // Validate body and sanitize fields.
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "category must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("createdTime")
    .isISO8601()

    .withMessage("Date must be a valid date"),
  body("image1", "image1 must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("image2").optional().trim().escape(),
  body("image3").optional().trim().escape(),
  body("image4").optional().trim().escape(),
  body("image5").optional().trim().escape(),

  async (req, res, next) => {
    const updatedProduct = new Product({
      name: he.decode(req.body.name),
      category: he.decode(req.body.category),
      createdTime: req.body.createdTime,
      image1: he.decode(req.body.image1),
      image2: req.body.image2 ? he.decode(req.body.image2) : undefined,
      image3: req.body.image3 ? he.decode(req.body.image3) : undefined,
      image4: req.body.image4 ? he.decode(req.body.image4) : undefined,
      image5: req.body.image5 ? he.decode(req.body.image5) : undefined,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    console.log(`updated product ${updatedProduct}  `);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ error: "Validation failed" });
    } else {
      try {
        jwt.verify(req.token, "secretkey");
        await Product.findByIdAndUpdate(req.params.id, updatedProduct, {});

        res.status(200).json({});
      } catch (error) {
        console.log("Error occurred bro:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  },
];

exports.product_delete = [
  getBearerHeaderToSetTokenStringOnReq,
  async (req, res, next) => {
    try {
      //if v erification vails , an error will be thrown
      jwt.verify(req.token, "secretkey");
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "product deleted" });
    } catch (error) {
      console.log(`error : ${error}`);
      next(error);
    }
  },
];
