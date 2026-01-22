<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <style>
        body { background: #0f0f0f; color: #00ff88; font-family: 'Courier New', monospace; text-align: center; padding-top: 15vh; }
        input { padding: 15px; width: 400px; border: 2px solid #00ff88; background: #000; color: #00ff88; border-radius: 5px; outline: none; }
        button { padding: 15px 25px; background: #00ff88; color: #000; border: none; cursor: pointer; font-weight: bold; border-radius: 5px; }
        button:hover { background: #00cc6a; }
    </style>
</head>
<body>
    <h1>SYSTEM_OVERRIDE_V3</h1>
    <p>Status: <span id="status">INITIALIZING...</span></p>
    <form id="proxy-form">
        <input id="url" type="text" placeholder="https://youtube.com">
        <button type="submit">BYPASS</button>
    </form>

    <script src="/uv/uv.bundle.js"></script>
    <script src="/uv/uv.config.js"></script>
    <script>
        const form = document.getElementById('proxy-form');
        const status = document.getElementById('status');

        // This is the "Guarantee" - Registering the worker before launch
        window.addEventListener('load', async () => {
            try {
                await navigator.serviceWorker.register('/uv.sw.js', {
                    scope: __uv$config.prefix
                });
                status.innerText = "ONLINE";
            } catch (err) {
                status.innerText = "ERROR: " + err.message;
            }
        });

        form.onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('url').value;
            let url = input.trim();
            if (!url.startsWith('http')) url = 'https://' + url;
            
            window.location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
        };
    </script>
</body>
</html>
