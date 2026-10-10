// Asks for the microphone once, from a normal tab. The grant belongs to the
// extension's origin, which the side panel shares.
const statusLine = document.getElementById("status");

async function allowMicrophone() {
  statusLine.textContent = "Waiting for Chrome's permission prompt…";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Only the permission is needed; release the microphone straight away.
    for (const track of stream.getTracks()) track.stop();
    statusLine.textContent = "Microphone allowed. Close this tab and reopen the side panel.";
  } catch (error) {
    statusLine.textContent =
      error.name === "NotAllowedError"
        ? "Microphone blocked. Allow it from the icon in the address bar, then press the button again."
        : `No microphone available (${error.name}).`;
  }
}

document.getElementById("allow").addEventListener("click", allowMicrophone);
