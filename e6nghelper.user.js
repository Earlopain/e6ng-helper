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
        const a = createSpeudoLinkElement();
        a.innerText = "x ";
        a.addEventListener("click", () => {
            toggleBlacklistTag(tag.innerText.replace(/ /g, "_"));
        });
        li.insertBefore(a, li.children[0]);
    }
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
            buttonDiv.classList.toggle("invisible");
        });
        for (let i = 0; i < buttons.length; i++) {
            if (i % buttonsPerRow === 0 && i !== 0) {
                buttonDiv.appendChild(document.createElement("br"));
            }
            const button = buttons[i];
            const buttonElement = document.createElement("div");
            buttonElement.classList.add("dtext-format-button");
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
    tagInput.classList.add("small-margin");
    tagInput.spellcheck = false;
    const tagCheckButton = document.createElement("button");
    const tagInsertButton = document.createElement("button");
    const sortTagsButton = document.createElement("button");
    const infoText = document.createElement("div");
    infoText.classList.add("tag-status-div");

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
    tagCheckButton.classList.add("small-margin");
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
    tagInsertButton.classList.add("small-margin");

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
    sortTagsButton.classList.add("small-margin");

    sortTagsButton.addEventListener("click", () => {
        const currentText = prepareInput(textarea.value);
        let tags = currentText.split(" ");
        //remove duplicates
        tags = [...new Set(tags)];
        tags.sort();
        textarea.value = tags.join(" ");
    });

    const tinyAliasButton = document.createElement("button");
    tinyAliasButton.classList.add("small-margin");
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

}

function prepareInput(input) {
    return input.trim().toLowerCase();
}

function prepareTagInput(input) {
    return input.trim().toLowerCase().replace(/ /g, "_");
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

function modifyBlacklist() {
    const blacklistWrapper = document.getElementById("blacklist-box");
    const blaclistList = document.getElementById("blacklist-list");
    if (blacklistWrapper === null) {
        return;
    }
    const divContainer = document.createElement("div");
    divContainer.style.paddingBottom = "5px";
    const a = createSpeudoLinkElement();
    a.innerHTML = "Click to " + getText(getConfig("hideblacklist", false));
    //only modify setting after hiding blacklist initially
    //becuase a.click also results in changing the setting
    let allowSetSettings = false;
    a.addEventListener("click", () => {
        blaclistList.classList.toggle("invisible");
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
    document.body.addEventListener("keypress", e => {
        if (e.target.type === "textarea" || e.target.type === "input") {
            return;
        }
        if (locationCheck("/posts/")) {
            handlePostShortcuts(e);
        }
    });
}

function handlePostShortcuts(e) {
    const loggedIn = isLoggedIn();
    if (e.keyCode === 114 && loggedIn) { //upvote
        document.querySelector(".post-vote-up-link").click();
    } else if (e.keyCode === 116 && loggedIn) { //downvote
        document.querySelector(".post-vote-down-link").click();
    }
}

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

function addSettingsMenu() {
    const header = document.getElementById("nav").querySelector("menu");
    const li = document.createElement("li");
    li.id = "nav-e6ng-helper";

    const a = createSpeudoLinkElement();
    a.id = "nav-e6ng-helper-link";
    a.innerText = "E6NG";
    a.addEventListener("click", () => {
        openSettingsTab("addSettingsMenu");
    });

    const settingsDiv = document.createElement("div");
    settingsDiv.id = "e6ng-settings";
    settingsDiv.classList.add("invisible");
    const settingsDivDraggable = document.createElement("div");
    settingsDivDraggable.id = "e6ng-settings-dragable";
    settingsDivDraggable.innerText = "E6NG Helper Settings";

    const settingsCloseButton = document.createElement("div");
    settingsCloseButton.id = "e6ng-settings-close";
    settingsCloseButton.innerHTML = "\u274C";
    settingsCloseButton.addEventListener("click", () => {
        settingsDiv.classList.add("invisible");
    });

    settingsDivDraggable.appendChild(settingsCloseButton);

    const settingsDivContent = document.createElement("div");
    settingsDivContent.id = "e6ng-settings-content";
    settingsDivContent.classList.add("small-margin");

    const settingsTabbar = document.createElement("div");
    settingsTabbar.id = "e6ng-settings-tabbar";

    for (const featureName of Object.keys(features)) {
        const feature = features[featureName];
        if (feature.divFunction === undefined) {
            continue;
        }
        const tabDiv = createSettingsDiv(featureName);
        const tabSelector = document.createElement("div");
        tabSelector.id = "e6ng-settings-tab-" + featureName;
        tabSelector.innerText = feature.title;
        tabSelector.classList.add("e6ng-settings-tab");
        tabSelector.classList.add("small-padding");

        tabSelector.addEventListener("click", () => {
            for (const element of document.querySelectorAll(".e6ng-tab-content")) {
                element.classList.add("invisible");
            }
            for (const element of document.querySelectorAll(".e6ng-settings-tab-selected")) {
                element.classList.remove("e6ng-settings-tab-selected");
            }
            tabSelector.classList.add("e6ng-settings-tab-selected");
            document.getElementById("e6ng-tab-content-" + featureName).classList.remove("invisible");
        });
        settingsTabbar.appendChild(tabSelector);
        settingsDivContent.appendChild(tabDiv);
    }

    settingsDiv.appendChild(settingsDivDraggable);
    settingsDiv.appendChild(settingsTabbar);
    settingsDiv.appendChild(settingsDivContent);

    li.appendChild(a);
    header.insertBefore(document.createTextNode(" "), header.children[header.childElementCount - 1]);
    header.insertBefore(li, header.children[header.childElementCount - 1]);
    document.body.appendChild(settingsDiv);
    dragElement(settingsDiv);
}

function openSettingsTab(featureName) {
    document.getElementById("e6ng-settings").classList.remove("invisible");
    document.getElementById("e6ng-settings-tab-" + featureName).click();
}

function redrawSettingsTab(featureName) {
    document.getElementById("e6ng-tab-content-" + featureName).replaceWith(createSettingsDiv(featureName));
}

function createSettingsDiv(featureName) {
    const tabDiv = features[featureName].divFunction();
    tabDiv.classList.add("e6ng-tab-content");
    tabDiv.id = "e6ng-tab-content-" + featureName;
    return tabDiv;
}

function settingsToggleDiv() {
    const div = document.createElement("div");
    const explainationDiv = document.createElement("div");
    explainationDiv.innerText = "Here you can toggle some settings if you do not want/need them";
    div.appendChild(explainationDiv);

    const settingsContainerDiv = document.createElement("div");

    const settings = getConfig("enabledfeatures", {});

    for (const featureSettingName of Object.keys(features)) {
        const settingsDiv = document.createElement("div");
        if (features[featureSettingName].showSettingsToggle === false) {
            continue;
        }
        const featureExplanationDiv = document.createElement("div");
        featureExplanationDiv.innerText = features[featureSettingName].description;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = settings[featureSettingName] !== false;

        checkbox.addEventListener("click", () => {
            settings[featureSettingName] = checkbox.checked;
        });

        settingsDiv.appendChild(featureExplanationDiv);
        settingsDiv.appendChild(checkbox);
        settingsContainerDiv.appendChild(settingsDiv);
    }

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";

    saveButton.addEventListener("click", () => {
        setConfig("enabledfeatures", settings);
    });

    div.appendChild(settingsContainerDiv);
    div.appendChild(saveButton);
    return div;
}

function createTinyAliasDiv() {
    const div = document.createElement("div");
    const explainationDiv = document.createElement("div");
    explainationDiv.innerText = "When you are uploading a post and insert a tag with the name you typed here, the complete text you entered will be inserted into the tag box";
    div.appendChild(explainationDiv);
    const createAliasDiv = document.createElement("div");
    createAliasDiv.appendChild(document.createTextNode("Alias name: "));

    const aliasNameInput = document.createElement("input");
    createAliasDiv.appendChild(aliasNameInput);
    createAliasDiv.appendChild(document.createTextNode(" Alias content: "));


    const aliasValueInput = document.createElement("textarea");
    aliasValueInput.id = "e6ng-settings-alias-valueinput";
    aliasValueInput.classList.add("small-margin");

    createAliasDiv.appendChild(aliasValueInput);

    const aliasCreateButton = document.createElement("button");
    aliasCreateButton.innerText = "Create";
    aliasCreateButton.classList.add("small-margin");
    aliasCreateButton.classList.add("small-padding");
    aliasCreateButton.addEventListener("click", () => {
        const aliasName = aliasNameInput.value.toLowerCase();
        const aliasContent = aliasValueInput.value.toLowerCase();
        if (aliasName === "") {
            return;
        }
        const currentAliases = getConfig("tinyalias", {});
        currentAliases[aliasName] = aliasContent;
        setConfig("tinyalias", currentAliases);
        Danbooru.notice("Added TinyAlias");
        redrawSettingsTab("tinyalias");
    });

    createAliasDiv.appendChild(aliasCreateButton);

    div.appendChild(createAliasDiv);

    const allAliases = getConfig("tinyalias", {});
    const allAliasesDiv = document.createElement("div");
    allAliasesDiv.id = "e6ng-settings-all-aliases";
    for (const aliasName of Object.keys(allAliases)) {
        const aliasDiv = document.createElement("div");
        aliasDiv.classList.add("settings-alias-container");
        const nameContainer = document.createElement("div");
        nameContainer.classList.add("settings-alias-name");
        nameContainer.innerText = aliasName;
        const deleteAlias = document.createElement("a");
        deleteAlias.href = "#";
        deleteAlias.innerText = " (remove)";

        deleteAlias.addEventListener("click", () => {
            aliasDiv.remove();
        });

        nameContainer.appendChild(deleteAlias);
        aliasDiv.appendChild(nameContainer);

        const input = document.createElement("textarea");
        input.value = allAliases[aliasName];
        aliasDiv.appendChild(input);
        allAliasesDiv.appendChild(aliasDiv)
    }
    div.appendChild(allAliasesDiv);

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";

    saveButton.addEventListener("click", () => {
        const aliases = {};
        for (const alias of allAliasesDiv.children) {
            const aliasName = alias.querySelector(".settings-alias-name").childNodes[0].textContent;
            const aliasContent = alias.querySelector("textarea").value;
            aliases[aliasName] = aliasContent;
        }
        setConfig("tinyalias", aliases);
        Danbooru.notice("TinyAlias saved");
    });

    div.appendChild(saveButton);
    return div;
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

function createSpeudoLinkElement() {
    const div = document.createElement("div");
    div.classList.add("e6ng-link");
    return div;
}

function insertCss() {
    const css = document.createElement("style");
    css.innerHTML = `
.invisible {
    display: none !important;
}

#e6ng-settings {
    position: fixed;
    top: 70px;
    right: 70px;
    width: 50%;
    height: 50%;
    background-color: #152F56;
    z-index: 5;
    display: flex;
    flex-flow: column;
    outline: 3px solid black;
}

#e6ng-settings-dragable {
    height: 35px;
    cursor: move;
    border-radius: 5px 5px 0px 0px;
    font-size: 20px;
    line-height: 30px;
    padding-left: 5px;
}

#e6ng-settings-close {
    height: 100%;
    width: 35px;
    float: right;
    line-height: 25px;
    font-size: 25px;
    text-align: right;
    cursor: default;
    margin-top: 5px;
    margin-right: 5px;
}

#e6ng-settings-tabbar {
    border-radius: 5px;
}

.e6ng-settings-tab {
    display: inline-block;
    border-radius: 5px;
    color: lightgrey;
}

.e6ng-settings-tab-selected {
    font-weight: bold;
    border-radius: 5px;
    color: white;
}

#e6ng-settings-content {
    height: 100%;
    border-radius: 5px;
    overflow: auto;
}

.e6ng-tab-content {
    height: 100%;
    padding-left: 5px;
    padding-right: 5px;
}

#e6ng-settings-alias-valueinput {
    min-width: 250px;
    display: inline-block;
}

#e6ng-settings-all-aliases {
    display: inline-block;
    width: 100%;
}

.e6ng-link {
    display: inline-block;
    white-space: pre;
    color: #b4c7d9;
    cursor: pointer;
}

.e6ng-link:hover {
    color: #2e76b4;
}

.settings-alias-container {
    padding-right: 10px;
    padding-bottom: 5px;
    width: 30%;
    height: 100px;
    display: flex;
    flex-direction: column;
    float: left;
}

.settings-alias-container textarea {
    width: 100%;
    height: 100%;
}

.settings-alias-name {
    text-align: center;
}

.dtext-format-button {
    width: 60px !important;
    height: 100% !important;
    margin-right: 5px !important;
    margin-bottom: 5px !important;
}

.dtext-format-button:hover {
    background-color: rgb(34, 65, 115) !important;
}

.small-margin {
    margin: 5px 5px 5px 5px;
}

.small-padding {
    padding: 5px 5px 5px 5px;
}

.tag-status-div {
    margin-top: 5px;
    height: 8px;
}
div#c-posts div.bottom-notices {
    display: block;
}

#has-children-relationship-preview {
    display: grid;
}

`;
    document.head.appendChild(css);
}

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
