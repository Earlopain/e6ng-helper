function addSettingsMenu() {
    const header = document.getElementById("nav").querySelector("menu");
    const li = document.createElement("li");
    li.id = "nav-e6ng-helper";

    const a = createPseudoLinkElement();
    a.id = "nav-e6ng-helper-link";
    a.classList.add("e6ng-extra-menuentry");
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
        featureExplanationDiv.classList.add("e6ng-inline");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = settings[featureSettingName] !== false;
        checkbox.classList.add("e6ng-inline");
        checkbox.classList.add("e6ng-small-margin");

        checkbox.addEventListener("click", () => {
            settings[featureSettingName] = checkbox.checked;
        });

        settingsDiv.appendChild(checkbox);
        settingsDiv.appendChild(featureExplanationDiv);
        settingsContainerDiv.appendChild(settingsDiv);
    }

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.classList.add("e6ng-small-margin");

    saveButton.addEventListener("click", () => {
        setConfig("enabledfeatures", settings);
        savedNotification();
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

    const settingsDefinition = {
        prefix: "tinyalias",
        classes: ["e6ng-float-left"],
        elements: [
            { name: "title" },
            { tagName: "br" },
            { tagName: "br" },
            { name: "content", tagName: "textarea" },
            { tagName: "br" }
        ],
        deleteButton: {
            ignoreMargin: true
        }
    }
    const container = document.createElement("div");
    container.style.display = "flow-root";

    for (const alias of getConfig(settingsDefinition.prefix, [])) {
        container.appendChild(createSettingsElement(settingsDefinition, alias));
    }
    div.appendChild(container);
    createSortable(container);

    const addButton = createSettingsAddButton(container, settingsDefinition);

    const saveButton = createSettingsSaveButton(settingsDefinition);
    div.appendChild(saveButton);
    div.appendChild(addButton);
    return div;
}

function settingsQuickLinks() {
    const settingsDefinition = {
        prefix: "quicklinks",
        displayName: "hint",
        elements: [
            "Title: ",
            { name: "title" },
            " URL: ",
            { name: "content" },
            " Hint: ",
            { name: "hint" },
            { name: "type", classes: ["e6ng-invisible"] }
        ],
        deleteButton: true
    }

    const div = document.createElement("div");

    const explainationDiv = document.createElement("div");
    explainationDiv.innerHTML = "Here you can configure which links will be displayed in the top right of the page<br>To reorder simple drag the elements around";
    div.appendChild(explainationDiv);

    const container = document.createElement("div");
    container.classList.add("e6ng-small-padding");

    for (const quickAccess of getConfig(settingsDefinition.prefix, defaultQuickAccess)) {
        container.appendChild(createSettingsElement(settingsDefinition, quickAccess));
    }
    div.appendChild(container);

    createSortable(container);

    const saveButton = createSettingsSaveButton(settingsDefinition)
    div.appendChild(saveButton);

    const addElement = createSettingsAddButton(container, settingsDefinition, defaultQuickAccess, { title: "", type: "link", hint: "Custom", content: "" });

    div.appendChild(addElement);
    return div;
}

function settingsDtextFormatting() {
    const settingsDefinition = {
        prefix: "dtextformatting",
        displayName: "title",
        elements: [
            "Title: ",
            { name: "title" },
            " Replacement: ",
            { name: "content" },
            { name: "element", classes: ["e6ng-invisible"] }
        ],
        deleteButton: true
    }

    const div = document.createElement("div");
    const explainationDiv = document.createElement("div");
    explainationDiv.innerHTML = "When you are writing a message you will see some extra buttons you can click to quckly insert dtex formatting<br><strong>$selection</strong> will be replaced with what you are currently selecting and <strong>$prompt</strong> will pop up a box where you can put something in yourself";
    div.appendChild(explainationDiv);

    const container = document.createElement("div");
    container.classList.add("e6ng-small-padding");

    for (const quickAccess of getConfig(settingsDefinition.prefix, defaultDtextFormatting)) {
        container.appendChild(createSettingsElement(settingsDefinition, quickAccess));
    }
    div.appendChild(container)

    createSortable(container);

    const saveButton = createSettingsSaveButton(settingsDefinition, () => {
        const perrow = parseInt(document.getElementById("e6ng-dtext-perrow").value);
        if (!isNaN(perrow) && perrow > 0) {
            setConfig("dtextbuttonsperrow", perrow);
        }
    });

    div.appendChild(saveButton);

    const addElement = createSettingsAddButton(container, settingsDefinition, defaultDtextFormatting, { title: "Custom", element: "span", content: "" });
    div.appendChild(addElement);

    div.appendChild(document.createTextNode(" Per row: "));

    const perRowInput = document.createElement("input");
    perRowInput.type = "number";
    perRowInput.value = getConfig("dtextbuttonsperrow", 7);
    perRowInput.id = "e6ng-dtext-perrow";
    perRowInput.min = 1;
    perRowInput.classList.add("e6ng-small-margin");

    div.appendChild(perRowInput);
    return div;
}

function settingsShortcuts() {
    const settingsDefinition = {
        prefix: "keyboardshortcuts",
        displayName: "title",
        elements: [
            "Shortcut: ",
            {
                name: "keycode", displayFunction: value => String.fromCharCode(value),
                saveFunction: value => value.charCodeAt(0), keyPress: e => {
                    e.target.value = String.fromCharCode(e.keyCode);
                    e.preventDefault();
                }
            },
            " Description: ",
            { name: "title" },
            { name: "location", classes: ["e6ng-invisible"] },
            { name: "needsLoggedIn", classes: ["e6ng-invisible"] }
        ],
        deleteButton: true
    }

    const div = document.createElement("div");

    const explainationDiv = document.createElement("div");
    explainationDiv.innerHTML = "Here you can change which shortcuts you want and how they should activate";
    div.appendChild(explainationDiv);

    const container = document.createElement("div");
    container.classList.add("e6ng-small-padding");
    const shortcuts = getConfig(settingsDefinition.prefix, defaultKeyboardShortcuts);
    for (const shortcut of shortcuts) {
        container.appendChild(createSettingsElement(settingsDefinition, shortcut));
    }
    div.appendChild(container)

    createSortable(container);

    const saveButton = createSettingsSaveButton(settingsDefinition);
    div.appendChild(saveButton);

    const addElement = createSettingsAddButton(container, settingsDefinition, defaultKeyboardShortcuts);
    div.appendChild(addElement);
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

function createSettingsElement(definition, values) {
    const container = document.createElement("div");
    container.classList.add("e6ng-small-padding");
    container.classList.add("e6ng-" + definition.prefix + "-container");

    if (definition.classes) {
        for (const className of definition.classes) {
            container.classList.add(className);
        }
    }

    for (const spec of definition.elements) {
        if (typeof spec === "string") {
            container.appendChild(document.createTextNode(spec));
        } else {
            const element = document.createElement(getValueOrDefault(spec.tagName, "input"));
            for (const cssClass of getValueOrDefault(spec.classes, [])) {
                element.classList.add(cssClass);
            }
            if (spec.name) {
                element.classList.add("e6ng-" + definition.prefix + "-" + spec.name);
                element.value = values[spec.name];
                if (spec.displayFunction) {
                    element.value = spec.displayFunction(element.value);
                }
                if (spec.keyPress) {
                    element.addEventListener("keypress", spec.keyPress);
                }
            }
            container.appendChild(element);
        }
    }
    if (definition.deleteButton) {
        const buttonRemove = document.createElement("button");
        if (definition.deleteButton.ignoreMargin !== true) {
            buttonRemove.style.marginLeft = "5px";
        }
        buttonRemove.innerText = "Remove";
        buttonRemove.addEventListener("click", () => {
            container.remove();
        });
        container.appendChild(buttonRemove);
    }
    return container;
}

function createSettingsSaveButton(definition, extra = () => { }) {
    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.addEventListener("click", () => {
        const settings = [];
        for (const element of document.querySelectorAll(".e6ng-" + definition.prefix + "-container")) {
            const entry = {};

            for (const spec of definition.elements) {
                if (typeof spec === "string" || spec.name === undefined) {
                    continue;
                }
                entry[spec.name] = element.querySelector(".e6ng-" + definition.prefix + "-" + spec.name).value;
                if (spec.saveFunction) {
                    entry[spec.name] = spec.saveFunction(entry[spec.name]);
                }
            }
            settings.push(entry);
        }
        setConfig(definition.prefix, settings);
        extra();
        savedNotification();
    });
    return saveButton;
}

function createSettingsAddButton(appendToThis, definition, values = [], custom = undefined) {
    const container = document.createElement("div");
    container.classList.add("e6ng-inline");
    const addSelector = document.createElement("select");
    const addButton = document.createElement("button");
    addButton.classList.add("e6ng-small-margin");
    addButton.innerText = "Add entry";
    addButton.addEventListener("click", () => {
        appendToThis.appendChild(createSettingsElement(definition, JSON.parse(addSelector.value)));
    });
    container.appendChild(addButton);
    if (values.length !== 0) {
        if (custom !== undefined) {
            addSelector.appendChild(createOption(custom))
        }

        for (const value of values) {
            addSelector.appendChild(createOption(value))
        }

        container.appendChild(addSelector);
    }

    return container;

    function createOption(value) {
        const option = document.createElement("option");
        option.value = JSON.stringify(value);
        option.innerText = value[definition.displayName];
        return option
    }
}
