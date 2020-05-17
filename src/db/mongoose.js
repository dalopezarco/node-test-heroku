const mongoose = require('mongoose');

console.log('Connecting to the database');
mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
    });

