import express from 'express';
import { createServer } from 'node:http';

const app = express();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Files - Google Drive</title>
            <link rel="icon" type="image/x-icon" href="https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico">
        </head>
        <body style="background:#1a1a1a;color:#eee;font-family:sans-serif;text-align:center;padding-top:10vh;">
            <div style="max-width:500px;margin:auto;padding:20px;border:1px solid #333;border-radius:10px;background:#222;">
                <h2>Secure Document Viewer</h2>
                <p style="color:#888;font-size:13px;">Enter a URL to preview the document</p>
                <input id="url" type="text" placeholder="example.com" style="width:80%;padding:10px;border-radius:5px;border:1px solid #444;background:#111;color:#fff;">
                <br><br>
                <button id="launch" style="width:85%;padding:10px;background:#4285f4;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Open Document</button>
            </div>

            <script>
                document.getElementById('launch').onclick = () => {
                    let target = document.getElementById('url').value.trim();
                    if (!target) return;
                    if (!target.startsWith('http')) target = 'https://' + target;

                    // We are using a different proxy engine (Rammerhead-style logic) 
                    // that doesn't use the blocked Service Worker.
                    // This uses a public web-proxy redirector.
                    
                    const proxyProvider = "https://api.codetabs.com/v1/proxy?quest=";
                    const finalUrl = proxyProvider + encodeURIComponent(target);

                    // Open in an iframe to keep the URL looking like Google Drive
                    document.body.innerHTML = \`
                        <div style="position:fixed;top:0;left:0;width:100%;height:40px;background:#333;display:flex;align-items:center;padding:0 20px;z-index:9999;">
                            <button onclick="window.location.reload()" style="background:#555;color:white;border:none;padding:5px 10px;border-radius:3px;cursor:pointer;">Home</button>
                            <span style="margin-left:20px;font-size:12px;color:#aaa;">Viewing: \${target}</span>
                        </div>
                        <iframe src="\${finalUrl}" style="position:fixed;top:40px;left:0;width:100%;height:calc(100% - 40px);border:none;"></iframe>
                    \`;
                };
            </script>
        </body>
        </html>
    `);
});

const server = createServer(app);
server.listen(process.env.PORT || 8080);
