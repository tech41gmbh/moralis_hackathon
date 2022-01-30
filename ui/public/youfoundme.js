/** @format */

window.addEventListener('message', receiveMessage, false);

// Listen to messages from the iframe
window.addEventListener('message', receiveMessage, false);

// Handle messages from the iframe
function receiveMessage(event) {
  // Check if the received message is a string and a glb url
  // if not ignore it, and print details to the console
  if (
    typeof event.data === 'string' &&
    event.data.startsWith('https://') &&
    event.data.endsWith('.glb')
  ) {
    const url = event.data;

    document.getElementById('iframe').hidden = true;
    document.getElementById('btnuse').hidden = false;
    document.getElementById('avatarUrl').hidden = false;
    document.getElementById('avatarUrl').value = event.data;
    document.getElementById('btnuse').click();
  } else {
    console.log(`Received message from unknown source: ${event.data}`);
  }
}

function displayIframe() {
  document.getElementById('avatarUrl').innerHTML = 'Avatar URL:';
  document.getElementById('iframe').hidden = false;
}
