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
    settingsDiv.classList.add("e6ng-invisible");
    const settingsDivDraggable = document.createElement("div");
    settingsDivDraggable.id = "e6ng-settings-dragable";
    settingsDivDraggable.innerText = "E6NG Helper Settings";

    const settingsCloseButton = document.createElement("div");
    settingsCloseButton.id = "e6ng-settings-close";
    settingsCloseButton.innerHTML = "\u274C";
    settingsCloseButton.addEventListener("click", () => {
        settingsDiv.classList.add("e6ng-invisible");
    });

    settingsDivDraggable.appendChild(settingsCloseButton);

    const settingsDivContent = document.createElement("div");
    settingsDivContent.id = "e6ng-settings-content";
    settingsDivContent.classList.add("e6ng-small-margin");

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
        tabSelector.classList.add("e6ng-small-padding");

        tabSelector.addEventListener("click", () => {
            for (const element of document.querySelectorAll(".e6ng-tab-content")) {
                element.classList.add("e6ng-invisible");
            }
            for (const element of document.querySelectorAll(".e6ng-settings-tab-selected")) {
                element.classList.remove("e6ng-settings-tab-selected");
            }
            tabSelector.classList.add("e6ng-settings-tab-selected");
            document.getElementById("e6ng-tab-content-" + featureName).classList.remove("e6ng-invisible");
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
    aliasValueInput.classList.add("e6ng-small-margin");

    createAliasDiv.appendChild(aliasValueInput);

    const aliasCreateButton = document.createElement("button");
    aliasCreateButton.innerText = "Create";
    aliasCreateButton.classList.add("e6ng-small-margin");
    aliasCreateButton.classList.add("e6ng-small-padding");
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
        aliasDiv.classList.add("e6ng-settings-alias-container");
        const nameContainer = document.createElement("div");
        nameContainer.classList.add("e6ng-settings-alias-name");
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
            const aliasName = alias.querySelector(".e6ng-settings-alias-name").childNodes[0].textContent;
            const aliasContent = alias.querySelector("textarea").value;
            aliases[aliasName] = aliasContent;
        }
        setConfig("tinyalias", aliases);
        Danbooru.notice("TinyAlias saved");
    });

    div.appendChild(saveButton);
    return div;
}

function openSettingsTab(featureName) {
    document.getElementById("e6ng-settings").classList.remove("e6ng-invisible");
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