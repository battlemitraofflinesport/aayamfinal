const app = require("../app");

module.exports = (req, res) => {
    // Prevent Vercel from duplicating the path or sending /api instead of the real route
    if (req.url.startsWith("/api/")) {
        req.url = req.url.replace(/^\/api/, "");
    }

    // Handle the root path properly
    if (req.url === "") {
        req.url = "/";
    }

    app(req, res);
};
