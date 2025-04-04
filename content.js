// content.js

// Function that creates and shows the popup (only if not already present)
function createOrShowThePopup() {
  // Only create if it doesn’t already exist
  if (!document.getElementById('break-reminder-popup')) {
    const popup = document.createElement('div');
    popup.id = 'break-reminder-popup';
    popup.style.position = 'fixed';
    popup.style.top = '10px';
    popup.style.right = '10px';
    popup.style.width = '400px';
    popup.style.height = 'auto';
    popup.style.backgroundColor = '#fff';
    popup.style.border = '1px solid #000';
    popup.style.borderRadius = '24px';
    popup.style.padding = '32px 24px';
    popup.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '10000';
    popup.style.opacity = '1';
    popup.style.animation = 'slideIn 0.5s forwards ease-out';

    const title = document.createElement('h2');
    title.textContent = "You've been working for a while! 🙌";
    title.style.color = '#111';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    popup.appendChild(title);

    const message = document.createElement('p');
    message.textContent = "Take a deep breath and sit for 1 minute to refresh your mental energy.";
    message.style.color = '#444';
    message.style.fontSize = '14px';
    message.style.marginBottom = '20px';
    popup.appendChild(message);

    const okayButton = document.createElement('button');
    okayButton.textContent = 'Okay';
    okayButton.style.marginRight = '10px';
    okayButton.style.padding = '8px 15px';
    okayButton.style.backgroundColor = '#007BFF';
    okayButton.style.color = 'white';
    okayButton.style.border = 'none';
    okayButton.style.borderRadius = '3px';
    okayButton.style.cursor = 'pointer';
    okayButton.onclick = () => {
      popup.style.animation = 'slideOut 0.5s forwards ease-in';
      setTimeout(() => popup.remove(), 500);
      chrome.runtime.sendMessage({ action: "resetAlarm" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error resetting alarm:", chrome.runtime.lastError.message);
        } else if (response && response.success) {
          console.log("Alarm reset successfully.");
        }
      });
    };
    popup.appendChild(okayButton);

    const remindButton = document.createElement('button');
    remindButton.textContent = 'Remind me in 10 minutes';
    remindButton.style.padding = '8px 15px';
    remindButton.style.backgroundColor = 'transparent';
    remindButton.style.color = 'black';
    remindButton.style.border = '1px solid black';
    remindButton.style.borderRadius = '3px';
    remindButton.style.cursor = 'pointer';
    remindButton.onclick = () => {
      chrome.runtime.sendMessage({ action: 'setRemindLater', minutes: 10 });
      popup.style.animation = 'slideOut 0.5s forwards ease-in';
      setTimeout(() => popup.remove(), 500);
    };
    popup.appendChild(remindButton);

    document.body.appendChild(popup);
  }

  // Insert CSS keyframe animation only if not already inserted
  if (!document.querySelector('style[data-popup-style]')) {
    const popupStyle = document.createElement('style');
    popupStyle.setAttribute('data-popup-style', 'true');
    popupStyle.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
    `;
    document.head.appendChild(popupStyle);
  }
}

// Listen for a message from background.js telling us to show the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showPopup") {
    createOrShowThePopup();
  }
});
