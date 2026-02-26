let app;
let initError = null;

try {
    app = require("../app");
} catch (err) {
    initError = err;
}

module.exports = (req, res) => {
    if (initError) {
        return res.status(500).send(`<pre>INIT ERROR:\n${initError.stack}</pre>`);
    }

    try {
        // Prevent Vercel from duplicating the path or sending /api instead of the real route
        if (req.url.startsWith("/api/")) {
            req.url = req.url.replace(/^\/api/, "");
        }

        // Handle the root path properly
        if (req.url === "") {
            req.url = "/";
        }

        app(req, res);
    } catch (runtimeErr) {
        res.status(500).send(`<pre>RUNTIME ERROR:\n${runtimeErr.stack}</pre>`);
    }
};
