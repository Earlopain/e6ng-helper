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
        title: "KeyboardShortcuts",
        divFunction: settingsShortcuts,
        description: "Adds additional shortcuts, currently r to upvote. t for downvote"
    },
    "insertDtextFormatting": {
        title: "Dtext Formatting",
        description: "Adds dtext formatting buttons. Select some text to enclose it",
        divFunction: settingsDtextFormatting
    },
    "instantSearchFiltering": {
        location: "=/posts|/posts?|=/",
        description: "Adds a extra search box bellow the current one where you can narrow your search and instantly see the results"
    },
    "hide18PlusBanner": {
        description: "Hides the annoying 18+ banner if you are logged out"
    },
    "colorRatingsOnPost": {
        location: "/posts/",
        description: "Readds the coloring for the rating on posts"
    },
    "removeQueryStringFromPosts": {
        location: "/posts/",
        description: "Removes that anoying extra bit from the url when you go to a post after"
    }
};

const defaultQuickAccess = [
    { title: "?", type: "link", hint: "Your Userpage", content: "https://e621.net/users/$userid" },
    { title: "M", type: "link", hint: "Your Dmails", content: "https://e621.net/dmails" },
    { title: "|", type: "none", hint: "Separator", content: "" },
    { title: "U", type: "link", hint: "Upload a Post", content: "https://e621.net/uploads/new" },
    { title: "D", type: "link", hint: "DNP List", content: "https://e621.net/wiki_pages/85" },
    { title: "S", type: "link", hint: "Edit user settings", content: "https://e621.net/users/$userid/edit" },
    { title: "L", type: "link", hint: "Logout", content: "https://e621.net/session/sign_out" }
];

const defaultDtextFormatting = [
    { title: "Bold", element: "strong", content: "[b]$selection[/b]" },
    { title: "Italics", element: "em", content: "[i]$selection[/i]" },
    { title: "Strike", element: "s", content: "[s]$selection[/s]" },
    { title: "Under", element: "u", content: "[u]$selection[/u]" },
    { title: "Super", element: "sup", content: "[sup]$selection[/sup]" },
    { title: "Spoiler", element: "span", content: "[spoiler]$selection[/spoiler]" },
    { title: "Color", element: "span", content: "[color=]$selection[/color]" },
    { title: "Code", element: "span", content: "`$selection`" },
    { title: "Heading", element: "span", content: "h2.$selection" },
    { title: "Quote", element: "span", content: "[quote]$selection[/quote]" },
    { title: "Section", element: "span", content: "[section=Title]$selection[/section]" },
    { title: "Tag", element: "span", content: "{{$selection}}" },
    { title: "Wiki", element: "span", content: "[[$selection]]" },
    { title: "Link", element: "span", content: "\"$selection\":" }
];

const defaultKeyboardShortcuts = [
    {
        title: "Upvote Post",
        action: "upvotepost",
        keycode: 114,
        location: "/posts/",
        needsLoggedIn: true
    },
    {
        title: "Downvote Post",
        action: "downvotepost",
        keycode: 116,
        location: "/posts/",
        needsLoggedIn: true
    }
];
