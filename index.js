import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';

const bare = createBareServer('/bare/');
const app = express();
const __dirname = process.cwd();

// Serve Ultraviolet files
app.use('/uv/', express.static(uvPath));

// MAIN PAGE (The search interface)
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#111;color:white;font-family:sans-serif;text-align:center;padding-top:100px;">
            <h1 style="color:#00ff88;">Adventure Proxy</h1>
            <p>Type a URL or search below:</p>
            <input id="url" type="text" placeholder="google.com" style="padding:12px;width:350px;border-radius:5px;border:none;">
            <button onclick="launch()" style="padding:12px 20px;cursor:pointer;background:#00ff88;border:none;border-radius:5px;font-weight:bold;">Launch</button>
            
            <script src="/uv/uv.bundle.js"></script>
            <script src="/uv/uv.config.js"></script>
            <script>
                async function launch() {
                    const input = document.getElementById('url').value;
                    let url = input.trim();
                    if (!url.startsWith('http')) url = 'https://' + url;
                    
                    // Register the Service Worker (The Engine)
                    await navigator.serviceWorker.register('/uv/uv.sw.js', {
                        scope: __uv$config.prefix
                    });

                    // Redirect to the proxied site
                    window.location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
                }
            </script>
        </body>
    `);
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
    console.log('Proxy is running on port 8080');
});
