import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';

const bare = createBareServer('/bare/');
const app = express();
const __dirname = process.cwd();

// Force serve the UV engine from the library
app.use('/uv/', express.static(uvPath));

// Fallback: If you don't have an index.html, this will create a basic one so you don't get a 404
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#111;color:white;font-family:sans-serif;text-align:center;padding-top:50px;">
            <h1>Proxy Active</h1>
            <input id="url" type="text" placeholder="Search Google or type URL" style="padding:10px;width:300px;">
            <button onclick="launch()">Go</button>
            <script src="/uv/uv.bundle.js"></script>
            <script src="/uv/uv.config.js"></script>
            <script>
                function launch() {
                    const url = document.getElementById('url').value;
                    window.location.href = '/uv/service/' + btoa(url);
                }
            </script>
        </body>
    `);
});

const server = createServer();
server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) bare.route(req, res);
    else app(req, res);
});
server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
    else socket.end();
});

server.listen(process.env.PORT || 8080);
