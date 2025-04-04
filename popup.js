// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const timeInput = document.getElementById("timeInterval");
  const saveButton = document.getElementById("saveButton");

  // Load the stored interval value
  chrome.storage.sync.get("interval", (data) => {
    if (data.interval) {
      timeInput.value = data.interval;
    }
  });

  // Save the new interval value
  saveButton.addEventListener("click", () => {
    const interval = parseFloat(timeInput.value);
    if (interval > 0) {
      chrome.storage.sync.set({ interval }, () => {
        // Explicitly send a message to create a new alarm
        chrome.runtime.sendMessage({ action: "startNewTimer", interval }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error starting timer:", chrome.runtime.lastError.message);
            alert(`Error setting timer: ${chrome.runtime.lastError.message}`);
          } else if (response && response.success) {
            console.log("Timer started successfully.");
            alert(`Break reminder set to ${interval} minutes.`);
          }
        });
      });
    } else {
      alert("Please enter a valid time in minutes.");
    }
  });
});
