const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/extract", async (req, res) => {
    const shareUrl = req.query.url;
    if (!shareUrl) return res.status(400).send("Missing URL");

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(shareUrl, { waitUntil: "networkidle2", timeout: 20000 });

        const videoUrl = await page.evaluate(() => {
            const video = document.querySelector("video");
            if (video && video.src) return video.src;
            const source = document.querySelector("video source");
            if (source && source.src) return source.src;
            return null;
        });

        await browser.close();

        if (videoUrl) {
            res.send(videoUrl);
        } else {
            res.status(404).send("Video URL not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error extracting video URL");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
