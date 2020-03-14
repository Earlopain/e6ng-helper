function locationCheck(location) {
    const domain = document.location.protocol + "//" + document.location.host;
    return document.location.href.startsWith(domain + location);
}

function isLoggedIn() {
    return getUsername() !== "Anonymous";
}

function getMeta(name) {
    return document.head.querySelector("[name~=" + name + "][content]").content;
}

function getUsername() {
    return getMeta("current-user-name");
}

function getUserid() {
    return getMeta("current-user-id");
}

function getAuthenticityToken() {
    return getMeta("csrf-token");
}

//https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(element) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    if (document.getElementById(element.id + "-dragable")) {
        document.getElementById(element.id + "-dragable").addEventListener("mousedown", e => {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener("mouseup", closeDragElement);
            // call a function whenever the cursor moves:
            document.addEventListener("mousemove", elementDrag);
        });
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        if (!isOutOfViewport(element, pos1, pos2)) {
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.top = (element.offsetTop - pos2) + "px";
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
    }
}

function isOutOfViewport(element, xOffset = 0, yOffset = 0) {
    let bounding = element.getBoundingClientRect();
    return bounding.left < xOffset ||
        bounding.top < yOffset ||
        bounding.right > window.innerWidth + xOffset ||
        bounding.bottom > window.innerHeight + yOffset;
};

function getComputedStyle(element) {
    const styles = window.getComputedStyle(element);
    if (styles.cssText !== '') {
        return styles.cssText;
    } else { //Fix for firefox
        const cssText = Object.values(styles).reduce(
            (css, propertyName) =>
                `${css}${propertyName}:${styles.getPropertyValue(
                    propertyName
                )};`
        );
        return cssText;
    }
}

async function insertCss() {
    let css;
    if (typeof GM_getResourceText !== "undefined") {
        css = document.createElement("style");
        css.innerHTML = GM_getResourceText("style");
    } else if (typeof GM !== "undefined" && GM.getResourceUrl) {
        css = document.createElement("link");
        const url = await GM.getResourceUrl("style");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = url
    } else {
        Danooru.error("Unsupported userscript manager");
        throw new Error("Unsupported userscript manager");
    }
    document.head.appendChild(css);
}

async function request(url, method, data = {}) {
    return new Promise(async (resolve, reject) => {
        let requestInfo = {
            "credentials": "include",
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "Header": "Userscript E6NG Helper by Earlopain"
            },
            "method": method,
            "mode": "cors"
        };
        if (method !== "GET" && method !== "get") {
            let postData = []
            data["authenticity_token"] = getAuthenticityToken();
            for (const key of Object.keys(data)) {
                postData.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
            }
            requestInfo.body = postData.join("&");
        }
        const request = await fetch(location.protocol + "//" + location.host + url, requestInfo);
        if (request.status >= 200 && request.status < 400) {
            resolve(await request.text());
        } else {
            reject();
        }
    })
}

async function getUrl(url) {
    return await request(url, "GET");
}

async function postUrl(url, json) {
    return await request(url, "POST", json);
}

function handleNetworkError() {
    Danbooru.error("A network error has occured");
}

function getConfig(name, defaultValue) {
    const settings = getSettings();
    if (settings === null || settings[name] === undefined) {
        return defaultValue;
    }
    return settings[name];
}

function setConfig(name, value) {
    const settings = getSettings();
    settings[name] = value;
    saveSettings(settings);
    return value;
}

function getSettings() {
    const storage = localStorage.getItem("e6nghelper");
    if (storage === null) {
        return {};
    }
    else {
        return JSON.parse(storage);
    }
}

function saveSettings(settings) {
    localStorage.setItem("e6nghelper", JSON.stringify(settings));
}

function createPseudoLinkElement() {
    const div = document.createElement("div");
    div.classList.add("e6ng-link");
    return div;
}

function prepareInput(input) {
    return input.trim().toLowerCase();
}

function prepareTagInput(input) {
    return input.trim().toLowerCase().replace(/ /g, "_");
}

function savedNotification() {
    Danbooru.notice("Successfully saved. Reload to see changes");
}
