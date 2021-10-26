const express = require('express');
const payment = require('./routes/payment');

const app = express();

const PORT = process.env.PORT || 5000; 

app.use(express.json());
app.use('/payment', payment);

app.listen(PORT, () => {
    console.log(`Listening on Port: ${PORT}`)
});