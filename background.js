// background.js

// Called when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  const defaultInterval = 120; // Default interval in minutes
  chrome.storage.sync.set({ interval: defaultInterval }, () => {
    console.log(`Default interval set to ${defaultInterval} minutes.`);
    setAlarm(defaultInterval); // Initialize the alarm
  });
});

// Single onAlarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(`Alarm triggered: ${alarm.name}`);

  // If it's either recurring or "remind me later," tell the content script to show the popup
  if (alarm.name === "breakReminder" || alarm.name === "breakReminderLater") {
    // Query for all tabs instead of just the active one
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        // Only try to send to supported URLs (not chrome:// or edge:// etc)
        if (tab.url && tab.url.startsWith('http')) {
          chrome.tabs.sendMessage(tab.id, { action: "showPopup" }, (response) => {
            // Handle any potential errors silently
            if (chrome.runtime.lastError) {
              console.log(`Could not send message to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
            }
          });
        }
      }
    });
  }
});

// Function to set (or reset) the alarm
function setAlarm(interval) {
  if (typeof interval !== "number" || interval <= 0) {
    console.error("Invalid interval. Alarm not set.");
    return;
  }

  console.log(`Setting alarm for ${interval} minutes.`);
  chrome.alarms.clear("breakReminder", () => {
    chrome.alarms.create("breakReminder", { delayInMinutes: interval });
    console.log(`Alarm created for ${interval} minutes.`);
  });
}

// Listen for changes in storage (e.g., user updates interval in popup)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.interval) {
    const newInterval = changes.interval.newValue;
    console.log(`Interval changed to ${newInterval}`);
    setAlarm(newInterval);
  }
});

// Listen for runtime messages (for reset or remind-later)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

  if (message.action === "resetAlarm") {
    // Just clear the alarm without creating a new one
    chrome.alarms.clear("breakReminder", () => {
      console.log("Alarm cleared after user clicked Okay.");
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }

  if (message.action === "setRemindLater") {
    const minutes = message.minutes || 10;
    chrome.alarms.create("breakReminderLater", { delayInMinutes: minutes });
    console.log(`One-time reminder set for ${minutes} minutes.`);
    sendResponse({ success: true });
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === "startNewTimer") {
    const interval = message.interval;
    if (typeof interval === "number" && interval > 0) {
      chrome.alarms.clear("breakReminder", () => {
        chrome.alarms.create("breakReminder", { delayInMinutes: interval });
        console.log(`New alarm explicitly created for ${interval} minutes.`);
        sendResponse({ success: true });
      });
    } else {
      console.error("Invalid interval for startNewTimer:", interval);
      sendResponse({ success: false, error: "Invalid interval" });
    }
    return true; // Keep the message channel open for async response
  }
});
