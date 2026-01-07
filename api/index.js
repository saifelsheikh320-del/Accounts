try {
    console.log("Loading server bundle...");
    const app = require('../dist/index.cjs');
    const finalApp = app.default || app;
    console.log("Server bundle loaded successfully.");
    module.exports = finalApp;
} catch (e) {
    console.error("CRITICAL ERROR LOADING SERVER BUNDLE:", e);
    module.exports = (req, res) => {
        res.status(500).json({
            error: "Server Initialization Failed",
            message: e.message,
            stack: e.stack,
            help: "Check if 'npm run build' was successful and dist/index.cjs exists."
        });
    };
}
