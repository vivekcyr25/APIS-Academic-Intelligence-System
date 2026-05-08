import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Safely load the CommonJS API handler
const umsSyncHandler = require('./api/ums-sync.js');

app.post('/api/ums-sync', async (req, res) => {
    console.log(`[server] POST /api/ums-sync | Action: ${req.body?.action}`);
    
    try {
        if (typeof umsSyncHandler === 'function') {
            await umsSyncHandler(req, res);
        } else {
            console.error('[server] UMS handler is not a function!');
            res.status(500).json({ success: false, message: 'API Handler Configuration Error' });
        }
    } catch (err) {
        console.error('[server] Handler Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Internal Server Sync Error' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`[backend] Academic Sync Server running at http://localhost:${PORT}`);
    console.log(`[backend] Logical routes mapped to api/ums-sync.js`);
});
