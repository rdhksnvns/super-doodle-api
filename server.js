const express = require('express');

const app = express();
app.use(express.json());


var accountRouter = require('./routes/account');

app.use('/api', accountRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
