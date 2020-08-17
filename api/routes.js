"use strict";

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const { Sequelize, sequelize, models } = require("./db");
const { User, Course } = models;

const router = express.Router();

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

/**
 * This authenticates the user based on the credentials parsed from the request object
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
const authenticate = async (req, res, next) => {
  let message = null;

  const credentials = auth(req);
  if (credentials) {
    const users = await models.User.findAll();
    const user = users.find((u) => u.emailAddress === credentials.name);
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );
      if (authenticated) {
        console.log(
          `Authentication successful for emailAdress: ${user.emailAddress}`
        );
        req.currentUser = user;
      } else {
        message = `Authentication failure for Postman username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }
  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};

/**
 * Makes sure that the minimum parameters are supplied in the request body
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

// Returns the currently authenticated user
router.get(
  "/users",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    });
  })
);

// Route that creates a new user.
router.post(
  "/users",
  [
    check("firstName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "firstName"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "lastName"'),
    check("emailAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "emailAddress"')
      .isEmail()
      .withMessage('Email must be a valid "email address" '),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map((error) => error.msg);
      // Returns validation errors to the client.
      return res.status(400).json({ errors: errorMessages });
    }

    // Hash the new
    const password = bcryptjs.hashSync(req.body.password);

    const user = await models.User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      password,
    });

    console.log(user);

    // Set the status to 201 Created and end the response.
    res.location("/").status(201).end();
  })
);
/**
 * returns all courses in json format after authenticating the user
 */
router.get("/courses", async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "estimatedTime",
        "materialsNeeded",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

/**
 * returns a specific course after authentication is successful
 */
router.get("/courses/:id", async (req, res, next) => {
  try {
    let message;
    const course = await Course.findOne({
      where: { id: req.params.id },
      attributes: [
        "id",
        "title",
        "description",
        "estimatedTime",
        "materialsNeeded",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });
    if (course != null) {
      message = res.status(200).json(course);
    } else {
      message = res
        .status(404)
        .json({ error: "We were unable to find the course you requested" });
    }
    return message;
  } catch (err) {
    next(err);
  }
});

/**
 * creates a new course and assigns it to either the current user or a user specified in the body
 */
router.post(
  "/courses",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
  ],
  authenticate,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    const course = await models.Course.create({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      userId: req.currentUser.id,
    });

    const id = course.id;

    res.location(`/courses/${id}`).status(201).end();
  })
);

/**
 * updates a specific course after validating, authenticating, and comparing the user and the request
 */
router.put(
  "/courses/:id",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("Please provide a value for title"),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("Please provide a value for description"),
  ],
  authenticate,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }
    const course = await models.Course.findByPk(req.params.id);
    const user = req.currentUser;

    if (course.userId === user.id) {
      await models.Course.update(
        {
          title: req.body.title,
          description: req.body.description,
          estimatedTime: req.body.estimatedTime,
          materialsNeeded: req.body.materialsNeeded,
        },
        { where: { id: req.params.id } }
      );
      res.status(204).end();
    } else {
      res.status(403).json("Wrong credentials");
    }
  })
);

/**
 * deletes a course after authenticating and comparing the user and the request
 */
router.delete(
  "/courses/:id",
  authenticate,
  async (req, res, next) => {
    try {
      const credentials = auth(req);
      const user = await User.findOne({
        where: { emailAddress: credentials.name },
      });
      const course = await Course.findOne({ where: { id: req.params.id } });
      if (user.id === course.userId) {
        next();
      } else {
        res.status(403).json({
          error:
            "The course you are attempting to modify is owned by a different user",
        });
      }
    } catch (err) {
      next(err);
    }
  },
  async (req, res, next) => {
    try {
      const deletedCourse = await Course.destroy({
        where: { id: req.params.id },
      });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

// {"title":"Test Course 4","description":"Another dummy test course"}
// {"firstName":"Test","lastName":"User","emailAddress":"test@user.com","password":"password"}
