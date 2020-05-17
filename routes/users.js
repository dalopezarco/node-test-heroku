var express = require('express');
var router = express.Router();
const User = require('../src/models/user');
const auth = require('../src/middleware/auth');

router.post('/', async function(req, res, next) {
  const user = new User(req.body);
  user.save().then(async (result) => {
    const token = await user.generateAuthToken();
    res.send({result, token});
  }).catch(err => {
    res.status(400);
    res.send(err);
  });
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email,
        req.body.password);
    const token = await user.generateAuthToken();
    res.send({user: user, token});
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/me', auth, function(req, res, next) {
  res.send(req.user);
});

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  User.findById(id).then(result => {
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  }).catch(err => {
    res.status(500);
    res.send(err);
  });
});

router.patch('/me', auth, async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(
      update => allowUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates'});
  }
  try {
    const user = req.user;
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }

});

router.delete('/me', auth, async (req, res, next) => {
  try {
    await req.user.remove();
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
