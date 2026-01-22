import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';

const app = express();
const bare = createBareServer('/bare/');
const __dirname = process.cwd();

// 1. SERVICE WORKER FIX: Point /uv/ to the actual library folder
app.use('/uv/', express.static(uvPath));

// 2. ROOT FIX: Serve the public folder
app.use(express.static(join(__dirname, 'public')));

// 3. BARE SERVER: Handle requests
app.use((req, res, next) => {
    if (bare.shouldRoute(req)) {
        bare.route(req, res);
    } else {
        next();
    }
});

// 4. Fallback to index.html
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const server = createServer(app);

// WebSockets are required for YouTube and to stop infinite loading
server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

server.listen(process.env.PORT || 8080, '0.0.0.0');
