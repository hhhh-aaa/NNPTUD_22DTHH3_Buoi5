var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// helpers
async function findById(id) {
  return await roleModel.findOne({ _id: id, isDeleted: false });
}

// get all roles
router.get('/', async function(req, res, next) {
  try {
    let data = await roleModel.find({ isDeleted: false });
    res.send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get role by id
router.get('/:id', async function(req, res, next) {
  try {
    let result = await findById(req.params.id);
    if (result) res.send(result);
    else res.status(404).send('ID NOT FOUND');
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// create role
router.post('/', async function(req, res, next) {
  try {
    let newRole = new roleModel({
      name: req.body.name,
      description: req.body.description
    });
    await newRole.save();
    res.send(newRole);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await roleModel.findByIdAndUpdate(id, req.body, { new: true });
    res.send(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// soft delete
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await roleModel.findById(id);
    if (!result) return res.status(404).send('ID NOT FOUND');
    result.isDeleted = true;
    await result.save();
    res.send(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// get all users having this role
router.get('/:id/users', async function(req, res, next) {
  try {
    let roleId = req.params.id;
    // verify role exists (optional)
    let role = await findById(roleId);
    if (!role) return res.status(404).send('ROLE NOT FOUND');
    let users = await userModel.find({ role: roleId, isDeleted: false });
    res.send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;