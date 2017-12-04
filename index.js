const express = require('express');
const server = express();

server.get('/', (req, res) => {
  res.send({hello: 'world'});
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server up on port ${PORT}`);
});
// did this work?