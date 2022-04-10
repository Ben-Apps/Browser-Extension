ID = "CONTEXT_MENU_MARK"

// Create in menu a subtopic
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: ID,
        title: 'Take as Note',
        contexts: ['all']
    });
});

// After menu point is clicked, push notes into local storage
chrome.contextMenus.onClicked.addListener(async (info, tabs) => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let result;
    try {
        [{result}] = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: () => getSelection().toString(),
        });
    } catch (e) {
        return; // ignoring an unsupported page like chrome://extensions
    }
    notices = []

    await chrome.storage.local.get('NOTES', function (data) {
        // Solution to get all notes
        var savedNoted = []
        let notes = data.NOTES;
        if (notes) {
            currentNotes = JSON.parse(notes);
            savedNoted = Object.values(currentNotes);
            console.log(notes + "Hellloo");
        }
        if (savedNoted.length > 0) {
            savedNoted.forEach(n => {
                notices.push(n)
            });
        }
        notices.push(result);
        console.log(notices + "Notices");
        chrome.storage.local.set({'NOTES': JSON.stringify(notices)});
    });
});


// Messaging between components
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(msg.name)
    if (msg.name === "SAVE") {
        fetch('http://127.0.0.1:8000/notes', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(msg.notice)
        }).then(res => res.json())
            .then(res => console.log(res));
    }
    return true;

});