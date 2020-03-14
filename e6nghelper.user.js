// ==UserScript==
// @name         E6NG Helper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Remake of the now defunct eSix Extend
// @author       Earlopain
// @homepage     https://e621.net/forum_topics/25872
// @supportURL   https://e621.net/forum_topics/25872
// @description  Remake of eSix extend with many features like dtext formating and TinyAlias
// @match        https://e621.net/*
// @match        https://e926.net/*
// @exclude      *.json
// @grant        GM.getResourceUrl
// @grant        GM_getResourceText
// @resource     style style.css
// @require      util.js?v=1
// @require      settingsPages.js?v=1
// @require      https://cdn.jsdelivr.net/npm/sortablejs@1.10.2/Sortable.min.js
// ==/UserScript==

const NETWORK_ERROR = -1;

const features = {
    "addSettingsMenu": {
        title: "Enable/Disable Settings",
        divFunction: settingsToggleDiv,
        description: "Adds an extra entry to the e6 menu bar to open this view",
        showSettingsToggle: false
    },
    "insertCss": {
        description: "Adds style information so this doesn't look like trash",
        showSettingsToggle: false
    },
    "setTitle": {
        needsLoggedIn: true,
        location: "/posts/",
        description: "If you faved/upvoted a post you will get a \u2665/\u2191 indicator in the tab title"
    },
    "moveBottomNotice": {
        location: "/posts/",
        description: "Moves the child/parent indicator on posts below the search bar for easy viewing"
    },
    "showUploader": {
        location: "/posts/",
        description: "Readds who uploaded a post to the infos"
    },
    "enhancePostUploader": {
        location: "/uploads/new",
        title: "TinyAlias",
        divFunction: createTinyAliasDiv,
        description: "Adds TinyAlias to the post uploder. Also adds the ability to check if a tag is valid or not"
    },
    "addQuickLinks": {
        title: "QuickAccess",
        divFunction: settingsQuickLinks,
        description: "Put custom links into the quick access bar, see settings tab for more",
    },
    "quickAddToBlacklist": {
        needsLoggedIn: true,
        description: "Adds a (x) before tags so you can quickly add/remove them from your blacklist"
    },
    "modifyBlacklist": {
        description: "Adds the possibility to hide which tags you have blacklisted"
    },
    "addExtraShortcuts": {
        description: "Adds additional shortcuts, currently r to upvote. t for downvote"
    },
    "insertDtextFormatting": {
        description: "Adds dtext formatting buttons. Select some text to enclose it"
    }
};

const defaultQuickAccess = [
    { title: "?", type: "link", hint: "Your userpage", content: "https://e621.net/users/$userid" },
    { title: "M", type: "link", hint: "Your Dmails", content: "https://e621.net/dmails" },
    { title: "S", type: "js", hint: "Your Subscriptions", content: "openSettingsTab('subscriptions')" },
    { title: "|", type: "none", hint: "", content: "" },
    { title: "U", type: "link", hint: "Upload a Post", content: "https://e621.net/uploads/new" },
    { title: "D", type: "link", hint: "DNP List", content: "https://e621.net/help/avoid_posting" },
    { title: "S", type: "link", hint: "Edit user settings", content: "https://e621.net/users/$userid/edit" },
    { title: "L", type: "link", hint: "Logout", content: "https://e621.net/session/sign_out" }
];

(function () {
    'use strict';

    const enabledFeatures = getConfig("enabledfeatures", {});
    const loggedIn = isLoggedIn();
    for (const featureFunction of Object.keys(features)) {
        const featureDefinition = features[featureFunction];
        if (featureDefinition.needsLoggedIn === true && loggedIn === false) {
            continue;
        }
        if (featureDefinition.location && locationCheck(featureDefinition.location) === false) {
            continue;
        }
        if (enabledFeatures[featureFunction] !== false) {
            //Using eval here because I don't know how to access functions otherwise
            //Normally in js you would use window[functioname]() but that doesn't work in userscripts
            eval(featureFunction + "(features)");
        }
    }

})();

function setTitle() {
    const oldTitle = document.title;
    let prefix = "";
    if (document.querySelector("#add-to-favorites").style.display === "none") {
        prefix += "\u2665 "; //heart symbol
    }
    if (document.querySelector("#post-vote-up-" + document.location.href.split("/").pop().split("?")[0]).classList.contains("score-positive")) {
        prefix += "\u2191 "; //arrow up
    } else if (document.querySelector("#post-vote-down-" + document.location.href.split("/").pop().split("?")[0]).classList.contains("score-negative")) {
        prefix += "\u2193 "; //arrow down
    }
    document.title = prefix + oldTitle;
}

function moveBottomNotice() {
    let a = document.querySelector(".bottom-notices");
    let sidebar = document.querySelector("#sidebar");
    sidebar.insertBefore(a, sidebar.children[2]);
    let clickThis = document.querySelector("#has-parent-relationship-preview-link");
    if (clickThis && document.querySelector("#has-parent-relationship-preview").style.display === "none") {
        clickThis.click();
    }
    let clickThisToo = document.querySelector("#has-children-relationship-preview-link");
    if (clickThisToo && document.querySelector("#has-children-relationship-preview").style.display === "none") {
        clickThisToo.click();
    }
}

function showUploader() {
    const uploaderName = document.getElementById("image-container").getAttribute("data-uploader");
    const uploaderId = document.getElementById("image-container").getAttribute("data-uploader-id");
    const ul = document.getElementById("post-information").querySelector("ul");
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "/users/" + uploaderId;
    a.innerText = uploaderName;
    li.appendChild(document.createTextNode("Uploader: "));
    li.appendChild(a);
    ul.appendChild(li);
}

function quickAddToBlacklist() {
    const tags = document.querySelectorAll(".search-tag");
    for (const tag of tags) {
        const li = tag.closest("li");
        const a = createPseudoLinkElement();
        a.innerText = "x ";
        a.addEventListener("click", () => {
            toggleBlacklistTag(tag.innerText.replace(/ /g, "_"));
        });
        li.insertBefore(a, li.children[0]);
    }

    async function toggleBlacklistTag(tag) {
        Danbooru.notice("Getting current blacklist");
        let currentBlacklist = await getCurrentBlacklist();
        if (currentBlacklist === NETWORK_ERROR) {
            return;
        }
        if (currentBlacklist.indexOf(tag) === -1) {
            currentBlacklist.push(tag);
            Danbooru.notice("Adding " + tag + " to blacklist");
        } else {
            currentBlacklist = currentBlacklist.filter(e => e !== tag);
            Danbooru.notice("Removing " + tag + " from blacklist");
        }
        await saveBlacklist(currentBlacklist);
        Danbooru.notice("Finished blacklist");
    }

    async function getCurrentBlacklist() {
        let response;
        try {
            response = await getUrl("/users/" + getUserid() + ".json");
        } catch (error) {
            handleNetworkError();
            return NETWORK_ERROR;
        }
        const json = JSON.parse(response);
        return json.blacklisted_tags.split("\n");
    }

    async function saveBlacklist(blacklistArray) {
        const blacklistString = blacklistArray.join("\n");
        const url = "/users/" + getUserid() + ".json";
        const json = {
            "_method": "patch",
            "user[blacklisted_tags]": blacklistString
        }
        try {
            await postUrl(url, json);
        } catch (error) {
            handleNetworkError();
        }
    }
}

function insertDtextFormatting() {
    const dtext = document.querySelectorAll(".dtext-previewable");
    const buttons = [
        { text: "Bold", element: "strong", insert: "[b]$selection[/b]" },
        { text: "Italics", element: "em", insert: "[i]$selection[/i]" },
        { text: "Strike", element: "s", insert: "[s]$selection[/s]" },
        { text: "Under", element: "u", insert: "[u]$selection[/u]" },
        { text: "Super", element: "sup", insert: "[sup]$selection[/sup]" },
        { text: "Spoiler", element: "span", insert: "[spoiler]$selection[/spoiler]" },
        { text: "Color", element: "span", insert: "[color=]$selection[/color]" },
        { text: "Code", element: "span", insert: "`$selection`" },
        { text: "Heading", element: "span", insert: "h2.$selection" },
        { text: "Quote", element: "span", insert: "[quote]$selection[/quote]" },
        { text: "Section", element: "span", insert: "[section=Title]$selection[/section]" },
        { text: "Tag", element: "span", insert: "{{$selection}}" },
        { text: "Wiki", element: "span", insert: "[[$selection]]" },
        { text: "Link", element: "span", insert: "\"$selection\":" }
    ];
    //Steal the styles from a button. If you append buttons before the textare they
    //somehow behave as if you clicked on send.
    const templateButton = document.createElement("button");
    //You can only get computed style on firefox if you append the element before
    document.body.appendChild(templateButton);
    const buttonStyleTemplate = getComputedStyle(templateButton);
    templateButton.remove();
    const buttonsPerRow = 7;
    for (const preview of dtext) {
        const textarea = preview.querySelector("textarea");
        const buttonDiv = document.createElement("div");
        const previewButton = preview.closest("form").querySelector(".dtext-preview-button");
        previewButton.addEventListener("click", () => {
            buttonDiv.classList.toggle("e6ng-invisible");
        });
        for (let i = 0; i < buttons.length; i++) {
            if (i % buttonsPerRow === 0 && i !== 0) {
                buttonDiv.appendChild(document.createElement("br"));
            }
            const button = buttons[i];
            const buttonElement = document.createElement("div");
            buttonElement.classList.add("e6ng-dtext-format-button");
            const buttonText = document.createElement(button.element);
            buttonText.innerText = button.text;
            buttonElement.appendChild(buttonText);
            buttonElement.style.cssText = buttonStyleTemplate;
            buttonElement.addEventListener("click", () => {
                const split = button.insert.split("$selection");
                let insertStart = split[0];
                let insertEnd = split[1];
                if (textarea.selectionStart || textarea.selectionStart == '0') {
                    const startPos = textarea.selectionStart;
                    const endPos = textarea.selectionEnd;
                    const selectedText = textarea.value.substring(startPos, endPos);
                    textarea.value = textarea.value.substring(0, startPos)
                        + insertStart + selectedText + insertEnd
                        + textarea.value.substring(endPos, textarea.value.length);
                } else {
                    textarea.value += insertStart + insertEnd;
                }
            });
            buttonDiv.appendChild(buttonElement);
        }
        preview.insertBefore(buttonDiv, textarea);
    }
}

function enhancePostUploader() {
    const textarea = document.getElementById("post_tags");
    const divContainer = document.createElement("div");

    const tagInput = document.createElement("input");
    tagInput.classList.add("e6ng-small-margin");
    tagInput.spellcheck = false;
    const tagCheckButton = document.createElement("button");
    const tagInsertButton = document.createElement("button");
    const sortTagsButton = document.createElement("button");
    const infoText = document.createElement("div");
    infoText.classList.add("e6ng-tag-status-div");

    let tagAlreadyChecked = false;

    tagInput.addEventListener("keyup", event => {
        if (event.keyCode !== 13) { //Enter
            return
        }
        if (tagAlreadyChecked) {
            tagInsertButton.click();
        } else {
            tagCheckButton.click();
        }
    });

    tagInput.addEventListener("input", () => {
        tagAlreadyChecked = false;
    })

    tagCheckButton.innerText = "Check";
    tagCheckButton.classList.add("e6ng-small-margin");
    tagCheckButton.addEventListener("click", async () => {
        if (insertTinyAlias(tagInput, textarea)) {
            return;
        }
        const currentTag = prepareTagInput(tagInput.value);

        if (tagAlreadyExists(currentTag)) {
            infoText.innerText = "Tag already added";
            return;
        }

        if (tagAlreadyChecked || currentTag === "") {
            return;
        }

        const tagInfo = await getTagInfo(currentTag, infoText);
        if (tagInfo.invalid) {
            infoText.innerText = "Invalid tagname";
            return;
        }
        tagAlreadyChecked = true;
        infoText.innerText = tagInfo.count + " posts";
        if (tagInfo.is_alias) {
            infoText.innerText += " " + currentTag + " is alias of " + tagInfo.true_name;
            tagInput.value = tagInfo.true_name;
        }
    });

    tagInsertButton.innerText = "Insert";
    tagInsertButton.classList.add("e6ng-small-margin");

    tagInsertButton.addEventListener("click", () => {
        if (insertTinyAlias(tagInput, textarea)) {
            return;
        }
        tagAlreadyChecked = false;
        const tag = prepareTagInput(tagInput.value);
        tagInput.value = "";
        const prefix = textarea.value.endsWith(" ") || textarea.value.length === 0 ? "" : " ";

        textarea.value += prefix + tag.toLowerCase();
        infoText.innerText = "";
    });

    sortTagsButton.innerText = "Sort";
    sortTagsButton.classList.add("e6ng-small-margin");

    sortTagsButton.addEventListener("click", () => {
        const currentText = prepareInput(textarea.value);
        let tags = currentText.split(" ");
        //remove duplicates
        tags = [...new Set(tags)];
        tags.sort();
        textarea.value = tags.join(" ");
    });

    const tinyAliasButton = document.createElement("button");
    tinyAliasButton.classList.add("e6ng-small-margin");
    tinyAliasButton.innerText = "TinyAlias";
    tinyAliasButton.addEventListener("click", () => openSettingsTab("enhancePostUploader"));

    divContainer.appendChild(document.createElement("br"));
    divContainer.appendChild(tagInput);
    divContainer.appendChild(tagCheckButton);
    divContainer.appendChild(tagInsertButton);
    divContainer.appendChild(sortTagsButton);
    divContainer.appendChild(tinyAliasButton);

    divContainer.appendChild(infoText);

    document.querySelector(".related-tag-functions").appendChild(divContainer);

    function tagAlreadyExists(tag) {
        const currentText = prepareInput(textarea.value);
        const tags = currentText.split(" ");
        return tags.indexOf(tag) !== -1;
    }

    function insertTinyAlias(inputElement, textarea) {
        const tinyAliases = getConfig("tinyalias", {});
        if (tinyAliases[inputElement.value]) {
            const prefix = textarea.value.endsWith(" ") || textarea.value.length === 0 ? "" : " ";
            textarea.value += prefix + tinyAliases[inputElement.value];
            inputElement.value = "";
            return;
        }
    }

    async function getTagInfo(tag, infoElement) {
        tag = encodeURIComponent(tag);
        const result = {
            count: 0,
            invalid: false,
            is_alias: false,
            true_name: undefined
        }

        let request;
        try {
            request = await getUrl("/tags/" + tag + ".json");
        } catch (error) {
            handleNetworkError();
            return;
        }
        let tagJson = JSON.parse(request);
        if (tagJson === null) {
            result.invalid = true;
            return result;
        } else if (tagJson.post_count !== 0) {
            result.count = tagJson.post_count;
            return result;
        }
        if (infoElement) {
            infoElement.innerText = "Checking alias...";
        }
        try {
            request = await getUrl("/tag_aliases.json?search[antecedent_name]=" + tag);
        } catch (error) {
            handleNetworkError();
            return;
        }
        const aliasJson = JSON.parse(request);
        if (aliasJson[0] === undefined) {
            return result;
        }
        result.is_alias = true;
        const trueTagName = aliasJson[0].consequent_name;
        try {
            request = await getUrl("/tags/" + encodeURIComponent(trueTagName) + ".json");
        } catch (error) {
            handleNetworkError();
            return;
        }
        tagJson = JSON.parse(request);
        result.count = tagJson.post_count;
        result.true_name = trueTagName;
        return result;
    }

}

function modifyBlacklist() {
    const blacklistWrapper = document.getElementById("blacklist-box");
    const blaclistList = document.getElementById("blacklist-list");
    if (blacklistWrapper === null) {
        return;
    }
    const divContainer = document.createElement("div");
    divContainer.style.paddingBottom = "5px";
    const a = createPseudoLinkElement();
    a.innerHTML = "Click to " + getText(getConfig("hideblacklist", false));
    //only modify setting after hiding blacklist initially
    //becuase a.click also results in changing the setting
    let allowSetSettings = false;
    a.addEventListener("click", () => {
        blaclistList.classList.toggle("e6ng-invisible");
        let currentStatus = getConfig("hideblacklist", false);
        if (allowSetSettings) {
            currentStatus = setConfig("hideblacklist", !currentStatus);
        }
        a.innerHTML = "Click to " + getText(currentStatus);
    });

    if (getConfig("hideblacklist", false)) {
        a.click();
    }
    allowSetSettings = true;
    divContainer.appendChild(a);
    blacklistWrapper.insertBefore(divContainer, blacklistWrapper.children[1]);

    function getText(status) {
        return status ? "show" : "hide";
    }
}

function addExtraShortcuts() {
    const loggedIn = isLoggedIn();
    const onPostsPage = locationCheck("/posts/");
    document.body.addEventListener("keypress", e => {
        if (e.target.type === "textarea" || e.target.type === "input") {
            return;
        }
        if (onPostsPage && loggedIn) {
            if (e.keyCode === 114) { //upvote
                document.querySelector(".post-vote-up-link").click();
            } else if (e.keyCode === 116) { //downvote
                document.querySelector(".post-vote-down-link").click();
            }
        }
    });
}

function addQuickLinks() {

    const links = getConfig("quicklinks", defaultQuickAccess);
    const extraLinksDiv = document.createElement("div");

    for (const link of links) {
        let element;
        switch (link.type) {
            case "link":
                element = document.createElement("a");
                element.innerText = link.title;
                element.href = prepareLink(link.content);
                break;
            case "js":
                element = createPseudoLinkElement();
                element.addEventListener("click", () => {
                    eval(link.content);
                });
                break;
            case "none":
                element = document.createElement("div");
                element.innerText = link.title;
                break;
            default:
                Danbooru.error("E6NG: Unknown action " + link.type);
                throw new Error("Unknown action " + link.type);
        }
        element.title = link.hint;
        element.classList.add("e6ng-extra-quicklinks");
        element.classList.add("e6ng-inline");
        extraLinksDiv.appendChild(element);
    }

    extraLinksDiv.classList.add("e6ng-float-right");
    extraLinksDiv.classList.add("e6ng-small-padding");

    const navBar = document.getElementById("nav");
    navBar.insertBefore(extraLinksDiv, navBar.lastElementChild);

    function prepareLink(link) {
        return link.replace(/\$userid/g, getUserid());
    }
}
