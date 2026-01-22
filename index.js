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
            <title>Google Drive</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico">
        </head>
        <body style="background:#111;color:white;font-family:sans-serif;text-align:center;padding-top:100px;">
            <h1>Adventure Proxy</h1>
            <p>If the button doesn't work, use <b>Cloak Mode</b></p>
            <input id="url" type="text" placeholder="google.com" style="padding:10px;width:300px;">
            <br><br>
            <button id="launch-btn" style="padding:10px 20px;background:#00ff88;border:none;border-radius:5px;cursor:pointer;">Normal Launch</button>
            <button id="cloak-btn" style="padding:10px 20px;background:#555;color:white;border:none;border-radius:5px;cursor:pointer;">Cloak Mode (Hidden)</button>

            <script src="/uv/uv.bundle.js"></script>
            <script>
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

                async function registerSW() {
                    return await navigator.serviceWorker.register('/uv/uv.sw.js', {
                        scope: window.__uv$config.prefix
                    });
                }

                document.getElementById('launch-btn').onclick = async () => {
                    let url = document.getElementById('url').value;
                    if (!url.startsWith('http')) url = 'https://' + url;
                    await registerSW();
                    window.location.href = window.__uv$config.prefix + btoa(url);
                };

                document.getElementById('cloak-btn').onclick = () => {
                    const win = window.open();
                    if (!win || win.closed) {
                        alert('Pop-up blocked! Please allow pop-ups for this site.');
                        return;
                    }
                    const url = document.getElementById('url').value;
                    const iframe = win.document.createElement('iframe');
                    win.document.body.style.margin = '0';
                    win.document.body.style.height = '100vh';
                    iframe.style.border = 'none';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.src = window.location.href; // This opens the proxy inside the cloak
                    win.document.body.appendChild(iframe);
                    window.location.replace('https://classroom.google.com'); // Redirects this tab to look safe
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
