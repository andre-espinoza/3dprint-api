const Flavour = require("../models/flavour");
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

exports.flavour_schema = asyncHandler(async (req, res, next) => {
  //
  const schema = Flavour.schema.paths;
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

exports.flavour_create = [
  getBearerHeaderToSetTokenStringOnReq,
  // Validate body and sanitize fields.
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),

  body("outOfStock", "outOfStock must be specified")
    .trim()
    .escape()
    .isBoolean(),

  // Process request after validation and sanitization.

  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    console.log(`body content is:${JSON.stringify(req.body)}`);

    const flavour = new Flavour({
      name: he.decode(req.body.name),

      outOfStock: req.body.outOfStock,
    });

    if (!errors.isEmpty()) {
      // There are errors.

      res.status(422).json({ error: "Validation failed" });
      return;
    } else {
      try {
        // Data from form is valid
        jwt.verify(req.token, "secretkey");
        await flavour.save();
        res.status(200).json({ flavour });
      } catch (err) {
        console.log(err);
      }
    }
  },
];

exports.flavour_list = asyncHandler(async (req, res, next) => {
  const flavours = await Flavour.find().sort({ name: 1 }).exec();
  console.log(`the flavours are ${flavours}`);
  res.json(flavours);
});

exports.flavour_update = [
  getBearerHeaderToSetTokenStringOnReq,
  // Validate body and sanitize fields.
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),

  body("outOfStock", "outOfStock must be specified")
    .trim()
    .escape()
    .isBoolean(),

  async (req, res, next) => {
    const updatedFlavour = new Flavour({
      name: he.decode(req.body.name),

      outOfStock: req.body.outOfStock,

      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ error: "Validation failed" });
    } else {
      try {
        jwt.verify(req.token, "secretkey");
        await Flavour.findByIdAndUpdate(req.params.id, updatedFlavour, {});
        res.status(200).json({});
      } catch (error) {
        console.log("Error occurred bro:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  },
];

exports.flavour_delete = [
  getBearerHeaderToSetTokenStringOnReq,
  async (req, res, next) => {
    try {
      //if v erification vails , an error will be thrown
      jwt.verify(req.token, "secretkey");
      await Flavour.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "flavour deleted" });
    } catch (error) {
      console.log(`error : ${error}`);
      next(error);
    }
  },
];
