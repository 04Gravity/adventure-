import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';

const bare = createBareServer('/bare/');
const app = express();
const __dirname = process.cwd();

// 1. Serve Ultraviolet files (This fixes the "Raw Code" error)
app.use('/uv/', express.static(uvPath));

// 2. Serve your static frontend files
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const server = createServer();

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.route(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

server.listen(process.env.PORT || 8080, () => {
    console.log('Adventure Proxy is live on port 8080');
});
