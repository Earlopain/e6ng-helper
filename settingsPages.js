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
        redrawSettingsTab("enhancePostUploader");
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
    new Sortable(allAliasesDiv, { animation: 150 });

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
        //no need to reload, changes will be picked up
        Danbooru.notice("TinyAlias saved");
    });

    div.appendChild(saveButton);
    return div;
}

function settingsQuickLinks() {
    const div = document.createElement("div");

    const explainationDiv = document.createElement("div");
    explainationDiv.innerHTML = "Here you can configure which links will be displayed in the top right of the page<br>To reorder simple drag the elements around";
    div.appendChild(explainationDiv);

    const container = document.createElement("div");
    container.classList.add("e6ng-small-padding");

    for (const quickAccess of getConfig("quicklinks", defaultQuickAccess)) {
        container.appendChild(createQuickLinkElement(quickAccess));
    }
    div.appendChild(container);

    new Sortable(container, { animation: 150 });

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";

    saveButton.addEventListener("click", () => {
        const newQuickLinks = [];
        for (const element of document.querySelectorAll(".e6ng-quicklinks-container")) {
            const quickLink = {
                title: element.querySelector(".e6ng-quicklinks-titleinput").value,
                type: element.querySelector(".e6ng-quicklinks-typeinput").value,
                hint: element.querySelector(".e6ng-quicklinks-hintinput").value,
                content: element.querySelector(".e6ng-quicklinks-contentinput").value
            }
            newQuickLinks.push(quickLink);
        }
        setConfig("quicklinks", newQuickLinks);
        savedNotification();
    });

    div.appendChild(saveButton);

    const addSelector = document.createElement("select");
    const addButton = document.createElement("button");
    addButton.classList.add("e6ng-small-margin");
    addButton.innerText = "Add entry";
    addButton.addEventListener("click", () => {
        container.appendChild(createQuickLinkElement(JSON.parse(addSelector.value)));
    });

    const customOption = document.createElement("option");
    customOption.value = JSON.stringify({ title: "", type: "link", hint: "", content: "" });
    customOption.innerText = "Custom";
    addSelector.appendChild(customOption);

    for (const link of defaultQuickAccess) {
        const option = document.createElement("option");
        option.value = JSON.stringify(link);
        option.innerText = link.hint;
        addSelector.appendChild(option)
    }

    div.appendChild(addButton);
    div.appendChild(addSelector);
    return div;

    function createQuickLinkElement(definition) {
        const quickAccessContainer = document.createElement("div");
        quickAccessContainer.classList.add("e6ng-small-padding");
        quickAccessContainer.classList.add("e6ng-quicklinks-container");
        quickAccessContainer.style.display = "table";

        quickAccessContainer.appendChild(document.createTextNode("Title: "));
        const titleInput = document.createElement("input");
        titleInput.classList.add("e6ng-quicklinks-titleinput");
        titleInput.value = definition.title;
        quickAccessContainer.appendChild(titleInput);


        quickAccessContainer.appendChild(document.createTextNode(" URL: "));
        const contentInput = document.createElement("input");
        contentInput.classList.add("e6ng-quicklinks-contentinput");
        contentInput.value = definition.content;
        quickAccessContainer.appendChild(contentInput);

        quickAccessContainer.appendChild(document.createTextNode(" Hint: "));
        const hintInput = document.createElement("input");
        hintInput.classList.add("e6ng-quicklinks-hintinput");
        hintInput.value = definition.hint;
        quickAccessContainer.appendChild(hintInput);

        const typeInput = document.createElement("input");
        typeInput.classList.add("e6ng-quicklinks-typeinput");
        typeInput.classList.add("e6ng-invisible");
        typeInput.value = definition.type;
        quickAccessContainer.appendChild(typeInput);

        const buttonRemove = document.createElement("button");
        buttonRemove.style.marginLeft = "5px";
        buttonRemove.innerText = "Remove";
        buttonRemove.addEventListener("click", () => {
            quickAccessContainer.remove();
        });
        quickAccessContainer.appendChild(buttonRemove);

        return quickAccessContainer;
    }
}

function settingsDtextFormatting() {
    const div = document.createElement("div");
    const explainationDiv = document.createElement("div");
    explainationDiv.innerHTML = "When you are writing a message you will see some extra buttons you can click to quckly insert dtex formatting<br><strong>$selection</strong> will be replaced with what you are currently selecting and <strong>$alert</strong> will pop up a box where you can put something in yourself";
    div.appendChild(explainationDiv);

    const container = document.createElement("div");
    container.classList.add("e6ng-small-padding");

    for (const quickAccess of getConfig("dtextformatting", defaultDtextFormatting)) {
        container.appendChild(createFormattingElement(quickAccess));
    }
    div.appendChild(container)

    new Sortable(container, { animation: 150 });

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";

    saveButton.addEventListener("click", () => {
        const newQuickLinks = [];
        for (const element of document.querySelectorAll(".e6ng-dtext-container")) {
            const quickLink = {
                title: element.querySelector(".e6ng-dtext-titleinput").value,
                element: element.querySelector(".e6ng-dtext-elementinput").value,
                content: element.querySelector(".e6ng-dtext-contentinput").value
            }
            newQuickLinks.push(quickLink);
        }
        setConfig("dtextformatting", newQuickLinks);

        const perrow = parseInt(document.getElementById("e6ng-dtext-perrow").value);
        if (!isNaN(perrow) && perrow > 0) {
            setConfig("dtextbuttonsperrow", perrow);
        }

        savedNotification();
    });

    div.appendChild(saveButton);

    const addSelector = document.createElement("select");
    const addButton = document.createElement("button");
    addButton.classList.add("e6ng-small-margin");
    addButton.innerText = "Add entry";
    addButton.addEventListener("click", () => {
        container.appendChild(createFormattingElement(JSON.parse(addSelector.value)));
    });

    const customOption = document.createElement("option");
    customOption.value = JSON.stringify({ title: "", element: "span", content: "" });
    customOption.innerText = "Custom";
    addSelector.appendChild(customOption);

    for (const formatting of defaultDtextFormatting) {
        const option = document.createElement("option");
        option.value = JSON.stringify(formatting);
        option.innerText = formatting.title;
        addSelector.appendChild(option)
    }

    div.appendChild(addButton);
    div.appendChild(addSelector);

    div.appendChild(document.createTextNode(" Per row: "));

    const perRowInput = document.createElement("input");
    perRowInput.type = "number";
    perRowInput.value = getConfig("dtextbuttonsperrow", 7);
    perRowInput.id = "e6ng-dtext-perrow";
    perRowInput.min = 1;
    perRowInput.classList.add("e6ng-small-margin");

    div.appendChild(perRowInput);


    return div;

    function createFormattingElement(definition) {
        const dtextContainer = document.createElement("div");
        dtextContainer.classList.add("e6ng-small-padding");
        dtextContainer.classList.add("e6ng-dtext-container");
        dtextContainer.style.display = "table";
        console.log(definition);
        dtextContainer.appendChild(document.createTextNode("Title: "));
        const titleInput = document.createElement("input");
        titleInput.classList.add("e6ng-dtext-titleinput");
        titleInput.value = definition.title;
        dtextContainer.appendChild(titleInput);


        dtextContainer.appendChild(document.createTextNode(" Replacement: "));
        const contentInput = document.createElement("input");
        contentInput.classList.add("e6ng-dtext-contentinput");
        contentInput.value = definition.content;
        dtextContainer.appendChild(contentInput);

        const elementInput = document.createElement("input");
        elementInput.classList.add("e6ng-dtext-elementinput");
        elementInput.classList.add("e6ng-invisible");
        elementInput.value = definition.element;
        dtextContainer.appendChild(elementInput);

        const buttonRemove = document.createElement("button");
        buttonRemove.style.marginLeft = "5px";
        buttonRemove.innerText = "Remove";
        buttonRemove.addEventListener("click", () => {
            dtextContainer.remove();
        });
        dtextContainer.appendChild(buttonRemove);

        return dtextContainer;
    }
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
