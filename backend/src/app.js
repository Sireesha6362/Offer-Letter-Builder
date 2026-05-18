const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/candidates', require('./routes/candidate.routes'));
app.use('/api/templates', require('./routes/template.routes'));
app.use('/api/offers', require('./routes/offer.routes'));

app.get('/', (req, res) => res.json({ message: 'Offer Letter API is running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));