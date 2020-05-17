var express = require('express');
var router = express.Router();
const Task = require('../src/models/task');
const auth = require('../src/middleware/auth');

router.post('/', auth, async (req, res, next) => {
  const task = new Task({
    ...req.body,
    ownerId: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/', function(req, res, next) {
  Task.find({}).then(result => {
    res.send(result);
  }).catch(err => {
    res.send(err);
  });
});

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  Task.findById(id).then(result => {
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  }).catch(err => {
    res.status(500).send(err);
  });
});

router.patch('/:id', async (req, res, next) => {
  const id = req.params.id;
  const updates = Object.keys(req.body);
  const allowUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(
      update => allowUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates'});
  }
  try {
    const task = await Task.findById(id);
    if (task) {
      updates.forEach(update => {
        task[update] = req.body[update];
      });
      task.save();
      res.send(task);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  Task.findByIdAndDelete(id).then(result => {
    if (result) {
      res.send(result);
    }
    res.status(404).send();
  }).catch(err => {
    res.status(500);
    res.send(err);
  });
});

module.exports = router;
