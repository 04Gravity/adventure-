import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const app = express();

// Serve the UV engine
app.use('/uv/', express.static(uvPath));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Classes</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico">
        </head>
        <body style="background:#000;color:#0f0;font-family:monospace;text-align:center;padding-top:10vh;">
            <h1>ADVENTURE_OS v2.0</h1>
            <p>Status: <span id="st">READY</span></p>
            <input id="url" type="text" placeholder="discord.com" style="background:#222;color:#0f0;border:1px solid #0f0;padding:10px;width:300px;">
            <button id="btn" style="padding:10px 20px;background:#0f0;color:#000;border:none;cursor:pointer;font-weight:bold;">BYPASS</button>

            <script src="/uv/uv.bundle.js"></script>
            <script>
                // We are using a PUBLIC Bare Server to avoid the "Refused to Connect" error
                window.__uv$config = {
                    prefix: '/uv/service/',
                    bare: 'https://bare.benroberts.dev/', 
                    encodeUrl: (url) => btoa(url),
                    decodeUrl: (url) => atob(url),
                    handler: '/uv/uv.handler.js',
                    bundle: '/uv/uv.bundle.js',
                    config: '/uv/uv.config.js',
                    sw: '/uv/uv.sw.js',
                };

                document.getElementById('btn').onclick = async () => {
                    let url = document.getElementById('url').value.trim();
                    if (!url) return;
                    if (!url.startsWith('http')) url = 'https://' + url;

                    document.getElementById('st').innerText = "REGISTERING...";
                    
                    try {
                        await navigator.serviceWorker.register('/uv/uv.sw.js', {
                            scope: window.__uv$config.prefix
                        });
                        window.location.href = window.__uv$config.prefix + btoa(url);
                    } catch (e) {
                        // If SW fails, we use the "Cloak" method automatically
                        document.getElementById('st').innerText = "SW_BLOCKED - LAUNCHING CLOAK...";
                        const win = window.open();
                        const iframe = win.document.createElement('iframe');
                        win.document.body.style.margin = '0';
                        win.document.body.style.height = '100vh';
                        iframe.style.border = 'none';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.src = window.location.href; 
                        win.document.body.appendChild(iframe);
                    }
                };
            </script>
        </body>
        </html>
    `);
});

const server = createServer(app);
server.listen(process.env.PORT || 8080);
