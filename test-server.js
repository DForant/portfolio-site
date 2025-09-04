// Simple test server
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

app.post('/api/contact/submit', (req, res) => {
    console.log('📧 Contact form submission received:', req.body);
    res.json({ success: true, message: 'Test message received!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📧 Contact form endpoint: http://localhost:${PORT}/api/contact/submit`);
});
