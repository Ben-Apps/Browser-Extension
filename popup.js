let textAreaField = document.getElementById("textArea")
let urlText = document.getElementById("urlWebsite")
let titleWebsite = document.getElementById("titleWebsite")
let btnSend = document.getElementById("btnSend")
let btnClear = document.getElementById("btnClear")
let notices = document.getElementById("notesTxt");
let btnSuggestion = document.getElementById("getSuggestion");
let textSuggestion = document.getElementById("suggestions");
let tagInput = document.getElementById("tagInput");

let url = ""
let title = ""
let learningDiary = ""
let highlights = []


/*
delete all highlights from storage
 */
btnClear.onclick = function () {
    chrome.storage.local.remove('NOTES', function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        window.location.reload();
    });
}

/*
Get suggestions from backend and show it in html.
 */
btnSuggestion.onclick = async function () {
    const apiURL = 'http://127.0.0.1:8000/tags';
    await fetch(apiURL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({url: url})
    }).then(response => response.json())
        .then(data => {
            data = JSON.parse(data)
            textSuggestion.innerHTML = data.TAGS
        })
}

/**
 * Send data to server after btn is clicked. Communication with api have to be done by [background.js]
 */
btnSend.onclick = function () {
    /**
     * Prepare data for backend
     */
    notice = {
        url: url,
        title: title,
        tags: tagInput.value.split(","),
        notes: textAreaField.value,
        highlights: highlights
    }
    /*
    Messaging with background service and make post call with data
     */
    chrome.runtime.sendMessage({name: "SAVE", notice: notice,}, (response) => {
    });
    window.location.reload();
}

// Get the URL of the current TAB
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    url = tabs[0].url;
    title = tabs[0].title;
    titleWebsite.innerHTML = "Title: " + title;
});


// After extension is opened, this method will be called
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('NOTES', (data) => {
        if (data.NOTES) {
            let notices = JSON.parse(data.NOTES)
            highlights = notices;
            console.log(typeof(highlights))
            if (notices != null) {
                console.log(notices);
                notices.forEach(notice => {
                    let p = document.createElement('p');
                    p.innerText = "-" + notice;
                    document.querySelector('#item-list').appendChild(p);
                })
            }
        }


    });
}, false);
