// server.js — APIS Express.js Bootstrap Entry Point
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`[backend] Academic Sync Server running at http://localhost:${PORT}`);
    console.log(`[backend] Logical routes mapped to api/ums-sync.js`);
});
