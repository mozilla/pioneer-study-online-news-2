"use strict";

let document;

const port = {
  on(header, handle) {
    addMessageListener(header, {
      receiveMessage(message) {
        if (message.name === header) {
          handle(message.data);
        }
      },
    });
  },
  emit(header, data) {
    sendAsyncMessage(header, data);
  },
};

port.on("PioneerOnlineNews::load", data => {
  content.addEventListener("load", () => load(data));
});

port.on("PioneerOnlineNews::update", update);

function load() {
  document = content.document; // eslint-disable-line no-native-reassign
  setupButtons();
}

function update(data) {
  const date = data.date;
  const dateElem = document.getElementById("date");
  dateElem.innerHTML = date;

  // Clears any text selected in the doorhanger (bug 1416204)
  content.getSelection().removeAllRanges();
}

function setupButtons() {
  const closeButton = document.getElementById("close-button");
  const learnMoreLink = document.getElementById("learn-more-link");

  closeButton.addEventListener("click", () => {
    port.emit("PioneerOnlineNews::dismiss");
  });

  learnMoreLink.addEventListener("click", ev => {
    ev.preventDefault();
    port.emit("PioneerOnlineNews::learn-more");
  });
}
