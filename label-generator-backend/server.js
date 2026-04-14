require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { bootstrapAuth } = require('./bootstrapAuth');
const { ensureSchema } = require('./bootstrapSchema');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const partRoutes = require('./routes/partRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/vendors', vendorRoutes);
app.use('/parts', partRoutes);
app.use('/generate', pdfRoutes);

const PORT = process.env.PORT || 5000;

bootstrapAuth()
  .then(() => ensureSchema())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
