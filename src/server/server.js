const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Enable detailed error logging
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

console.log('Starting server...');

// Load configuration
let config;
try {
    console.log('Loading configuration...');
    const configPath = path.join(__dirname, '../../config.json');
    console.log('Config path:', configPath);
    const configContent = fs.readFileSync(configPath, 'utf8');
    console.log('Config content:', configContent);
    config = JSON.parse(configContent);
    console.log('Configuration loaded successfully');
} catch (error) {
    console.error('Error loading config:', error);
    process.exit(1);
}

const app = express();
const PORT = config.server.port || 3002;

console.log('Setting up middleware...');

// Basic CORS setup
app.use(cors({
    origin: config.server.cors.origin,
    credentials: config.server.cors.credentials,
    methods: config.server.cors.methods,
    allowedHeaders: config.server.cors.allowedHeaders
}));

// Increase JSON payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Serve JavaScript files with correct MIME type
app.use('/js', express.static(path.join(__dirname, '../../js'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    console.log('Contact endpoint hit');
    try {
        console.log('Received request body:', req.body);
        
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            console.error('Missing required fields:', { name, email, subject, message });
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { name, email, subject, message }
            });
        }

        // Store contact form submission
        const contactData = {
            timestamp: new Date().toISOString(),
            name,
            email,
            subject,
            message
        };

        const contactLogPath = path.join(__dirname, '../../data/contacts', `${Date.now()}.json`);
        fs.mkdirSync(path.join(__dirname, '../../data/contacts'), { recursive: true });
        fs.writeFileSync(contactLogPath, JSON.stringify(contactData, null, 2));

        console.log('Stored contact form submission:', {
            name,
            email,
            subject,
            timestamp: contactData.timestamp
        });
        
        return res.status(200).json({ 
            message: 'Contact form submitted successfully!',
            timestamp: contactData.timestamp
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        return res.status(500).json({ 
            message: 'Error processing contact form',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 