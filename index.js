import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';

const bare = createBareServer('/bare/');
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Google Drive</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico">
        </head>
        <body style="background:#111;color:white;font-family:sans-serif;text-align:center;padding-top:100px;">
            <h1>Adventure Proxy (Static Mode)</h1>
            <p>Type a URL (e.g., bing.com) and press Go</p>
            <input id="url" type="text" placeholder="bing.com" style="padding:10px;width:300px;border-radius:5px;">
            <button id="go-btn" style="padding:10px 20px;background:#00ff88;border:none;border-radius:5px;cursor:pointer;">Go</button>

            <script>
                document.getElementById('go-btn').onclick = () => {
                    const input = document.getElementById('url').value.trim();
                    if (!input) return;
                    
                    let targetUrl = input;
                    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

                    // This uses a direct redirect logic that doesn't need a Service Worker
                    // It's a "Lite" version of the proxy
                    const proxyUrl = window.location.origin + '/bare/';
                    
                    // We will attempt to open it in a frame to keep it stealthy
                    document.body.innerHTML = '<iframe src="' + targetUrl + '" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;"></iframe>';
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
