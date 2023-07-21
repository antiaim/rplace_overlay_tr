// ==UserScript==
// @name         Drednot.io r/place Overlay (Based on Titanplace Overlay)
// @version      1.0
// @description  A visual overlay to show errors in tile colors of a desired image in r/place (forked from https://github.com/marcus-grant/place-overlay)
// @author       cogg + @meadowlands + SnowFox143
// @match        https://garlic-bread.reddit.com/embed*
// @grant        GM_xmlhttpRequest
// @license      GPL-3.0
// ==/UserScript==

// Update URL

const OVERLAY_PARAMS_URL = "https://raw.githubusercontent.com/antiaim/rplace_overlay_tr/main/params.json"

let WHITELISTED_DOMAINS = ["https://raw.githubusercontent.com", "https://tmp.bz"]

let OVERLAY_PARAMS = {
    source: null,
    offset_x: null,
    offset_y: null,
    width: null,
    height: null
}

let overlay_params_last_version = -1

const overlay_canvas = document.createElement("canvas")

let overlay_image = new Image()






async function updateOverlayParams(url) {

    // Fuck reddit and its CSP.
    let json = await new Promise((resolve, reject) => {
        GM.xmlHttpRequest({ method: "GET", url: url, onload: (resp) => resolve(resp.responseText) })
    })
    console.log(json)
    let NEW_OVERLAY_PARAMS = JSON.parse(json)
    if (!WHITELISTED_DOMAINS.some(domain => NEW_OVERLAY_PARAMS.source.startsWith(domain))) throw new Error("Overlay image source not whitelisted")
    overlay_params_last_version = OVERLAY_PARAMS.version < NEW_OVERLAY_PARAMS.version ? OVERLAY_PARAMS.version : overlay_params_last_version
    OVERLAY_PARAMS = NEW_OVERLAY_PARAMS
}

function updateOverlayCanvas() {
    if (OVERLAY_PARAMS.version > overlay_params_last_version) {
        overlay_canvas.width = OVERLAY_PARAMS.width*3;
        overlay_canvas.height = OVERLAY_PARAMS.height*3;

        let ctx = overlay_canvas.getContext("2d");
        ctx.fillStyle = "red";
        overlay_image = new Image()
        overlay_image.src = OVERLAY_PARAMS.source+"?t="+(0|(Math.random()*9999999));
        overlay_image.onload = () => {

            ctx.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height)
            ctx.drawImage(overlay_image, 0, 0, overlay_canvas.width, overlay_canvas.height);

            for (let x=-1;x<overlay_canvas.width;x+=3) {
                ctx.clearRect(x,0,2,overlay_canvas.height);
            }

            for (let y=-1;y<overlay_canvas.height;y+=3) {
                ctx.clearRect(0,y,overlay_canvas.width,2);
            }
        }
    }

    overlay_canvas.style = `position: absolute;left: ${OVERLAY_PARAMS.offset_x}px;top: ${OVERLAY_PARAMS.offset_y}px;image-rendering: pixelated;width:${OVERLAY_PARAMS.width}px;height:${OVERLAY_PARAMS.height}px`;
    console.log("Updated canvas");
    //return canvas;
}

async function updateOverlay() {
    await updateOverlayParams(OVERLAY_PARAMS_URL)
    updateOverlayCanvas()
    window.OVERLAY_PARAMS = OVERLAY_PARAMS
    window.overlay_params_last_version = overlay_params_last_version
}

console.log("Starting update schedule")
updateOverlay()
setInterval(updateOverlay, 60000)


if (window.top !== window.self) {
    window.addEventListener('load', () => {
      document
        .getElementsByTagName("garlic-bread-embed")[0]
        .shadowRoot
        .children[0]
        .getElementsByTagName("garlic-bread-share-container")[0]
        .getElementsByTagName("garlic-bread-camera")[0]
        .getElementsByTagName("garlic-bread-canvas")[0]
        .shadowRoot
        .children[0]
        .appendChild(overlay_canvas)
  }, false);
}
