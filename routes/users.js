var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// -- helpers --------------------------------------------------------------
async function findById(id) {
  return await userModel.findOne({ _id: id, isDeleted: false });
}

// R: get all users, supports ?username=includes
router.get('/', async function(req, res, next) {
  try {
    let filter = { isDeleted: false };
    if (req.query.username) {
      filter.username = { $regex: req.query.username, $options: 'i' };
    }
    let data = await userModel.find(filter);
    res.send(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// R: get by id
router.get('/:id', async function(req, res, next) {
  try {
    let result = await findById(req.params.id);
    if (result) res.send(result);
    else res.status(404).send('ID NOT FOUND');
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// C: create new user
router.post('/', async function(req, res, next) {
  try {
    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount
    });
    await newUser.save();
    res.send(newUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// U: update user by id
router.put('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    res.send(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// D: soft delete
router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id);
    if (!result) return res.status(404).send('ID NOT FOUND');
    result.isDeleted = true;
    await result.save();
    res.send(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// enable account (set status true)
// body: { email, username }
router.post('/enable', async function(req, res, next) {
  try {
    let { email, username } = req.body;
    let user = await userModel.findOne({ email, username });
    if (!user) return res.status(404).send('USER NOT FOUND');
    user.status = true;
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// disable account (set status false)
router.post('/disable', async function(req, res, next) {
  try {
    let { email, username } = req.body;
    let user = await userModel.findOne({ email, username });
    if (!user) return res.status(404).send('USER NOT FOUND');
    user.status = false;
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
