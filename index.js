import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const bare = createBareServer('/bare/');
const app = express();

app.use('/uv/', express.static(uvPath));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Google Drive - My Files</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico">
        </head>
        <body style="background:#111;color:white;font-family:sans-serif;text-align:center;padding-top:100px;">
            <h1 id="status">Adventure Proxy</h1>
            <p id="subtext">Enter a URL to start browsing</p>
            <input id="url" type="text" placeholder="discord.com" style="padding:10px;width:300px;border-radius:5px;">
            <button id="launch-btn" style="padding:10px 20px;background:#00ff88;border:none;border-radius:5px;cursor:pointer;">Launch</button>

            <script src="/uv/uv.bundle.js"></script>
            <script>
                // Manual Config
                window.__uv$config = {
                    prefix: '/uv/service/',
                    bare: '/bare/',
                    encodeUrl: (url) => btoa(url),
                    decodeUrl: (url) => atob(url),
                    handler: '/uv/uv.handler.js',
                    bundle: '/uv/uv.bundle.js',
                    config: '/uv/uv.config.js',
                    sw: '/uv/uv.sw.js',
                };

                const btn = document.getElementById('launch-btn');
                const status = document.getElementById('status');

                btn.onclick = async () => {
                    let url = document.getElementById('url').value.trim();
                    if (!url) return;
                    if (!url.startsWith('http')) url = 'https://' + url;

                    status.innerText = "Loading Engine...";
                    btn.disabled = true;

                    try {
                        // Register SW with a timestamp to bypass school cache
                        const registration = await navigator.serviceWorker.register('/uv/uv.sw.js?v=' + Date.now(), {
                            scope: window.__uv$config.prefix
                        });

                        if (registration.active || registration.installing || registration.waiting) {
                            status.innerText = "Connecting...";
                            window.location.href = window.__uv$config.prefix + btoa(url);
                        } else {
                            status.innerText = "Error: SW Failed to Start";
                        }
                    } catch (err) {
                        status.innerText = "Blocked: " + err.name;
                        document.getElementById('subtext').innerText = "Your school might be blocking Service Workers. Try a different browser or 'About:Blank' mode.";
                        btn.disabled = false;
                    }
                };
            </script>
        </body>
        </html>
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
