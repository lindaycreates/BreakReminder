// content.js

function createOrShowThePopup() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Remove existing popup and overlay if they exist
  const existingPopup = document.getElementById('break-reminder-popup');
  if (existingPopup) existingPopup.remove();
  const existingOverlay = document.getElementById('break-reminder-overlay');
  if (existingOverlay) existingOverlay.remove();

  // Create dimmed overlay
  const overlay = document.createElement('div');
  overlay.id = 'break-reminder-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  overlay.style.zIndex = '9999';
  overlay.style.opacity = '0';
  overlay.style.animation = 'fadeIn 0.3s forwards ease-out';

  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'break-reminder-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.width = '400px';
  popup.style.padding = '32px 24px';
  popup.style.borderRadius = '24px';
  popup.style.zIndex = '10000';
  popup.style.animation = 'slideIn 0.5s forwards ease-out';

  // Glassmorphism styles with dark mode handling
  popup.style.backdropFilter = 'blur(16px) saturate(180%)';
  popup.style.webkitBackdropFilter = 'blur(16px) saturate(180%)';

  if (isDarkMode) {
    popup.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
    popup.style.color = '#eee';
    popup.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    popup.style.boxShadow = '0 0 24px rgba(255, 255, 255, 0.15)';
  } else {
    popup.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    popup.style.color = '#111';
    popup.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    popup.style.boxShadow = '0 0 24px rgba(0, 0, 0, 0.1)';
  }

  if (!prefersReducedMotion) {
    popup.style.animation = 'slideIn 0.5s forwards ease-out';
    overlay.style.animation = 'fadeIn 0.3s forwards ease-out';
  } else {
    popup.style.transition = 'none';
    overlay.style.transition = 'none';
  }  
  
  if (prefersReducedMotion) {
    popup.style.transition = 'none';
    overlay.style.transition = 'none';
  }  

  // Image
  const image = document.createElement('img');
  const imagePath = chrome.runtime.getURL('icons/lotus.png');
  console.log("🔍 Debug - Attempting to load image from:", imagePath);
  
  image.src = imagePath;
  image.alt = 'Lotus';
  image.style.width = '100%';
  image.style.maxWidth = '200px';
  image.style.height = 'auto';
  image.style.display = 'block';
  image.style.margin = '0 auto 20px auto';

  image.onload = () => {
    console.log("✅ Image loaded successfully from:", imagePath);
    console.log("Image dimensions:", image.naturalWidth, "x", image.naturalHeight);
  };
  
  image.onerror = (error) => {
    console.error("❌ Image failed to load:", {
      path: imagePath,
      error: error,
      runtimeURL: chrome.runtime.getURL(''),
      extensionId: chrome.runtime.id
    });
  };

  popup.appendChild(image);

  // Title
  const title = document.createElement('h2');
  title.textContent = "Great job! You deserve a break.";
  title.style.fontSize = '32px';
  title.style.fontWeight = '500';
  title.style.marginBottom = '8px';
  title.style.textAlign = 'center';
  title.style.color = isDarkMode ? '#fff' : '#111';
  popup.appendChild(title);

  // Message
  const message = document.createElement('p');
  message.textContent = "Take slow, deep breaths for at least 1 minute to calm your mind and sharpen your focus.";
  message.style.fontSize = '16px';
  message.style.marginBottom = '20px';
  message.style.textAlign = 'center';
  message.style.color = isDarkMode ? '#ccc' : '#444';
  popup.appendChild(message);

  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.justifyContent = 'center';
  buttonsContainer.style.gap = '12px';

  // Okay button
  const okayButton = document.createElement('button');
  okayButton.textContent = 'Okay';
  okayButton.style.padding = '8px 15px';
  okayButton.style.backgroundColor = isDarkMode ? '#0A84FF' : '#007BFF';
  okayButton.style.color = '#fff';
  okayButton.style.border = 'none';
  okayButton.style.borderRadius = '6px';
  okayButton.style.cursor = 'pointer';

  okayButton.onclick = () => {
    if (!prefersReducedMotion) {
      popup.style.animation = 'slideOut 0.5s forwards ease-in';
      overlay.style.animation = 'fadeOut 0.5s forwards ease-in';
    }
    setTimeout(() => {
      popup.remove();
      overlay.remove();
    }, prefersReducedMotion ? 0 : 500);
    chrome.runtime.sendMessage({ action: "resetAlarm" });
  };  

  // Remind me later button
  const remindButton = document.createElement('button');
  remindButton.textContent = 'Remind me in 10 minutes';
  remindButton.style.padding = '8px 15px';
  remindButton.style.backgroundColor = 'transparent';
  remindButton.style.border = `1px solid ${isDarkMode ? '#ccc' : '#000'}`;
  remindButton.style.color = isDarkMode ? '#ccc' : '#000';
  remindButton.style.borderRadius = '6px';
  remindButton.style.cursor = 'pointer';

  remindButton.onclick = () => {
    if (!prefersReducedMotion) {
      popup.style.animation = 'slideOut 0.5s forwards ease-in';
      overlay.style.animation = 'fadeOut 0.5s forwards ease-in';
    }
    setTimeout(() => {
      popup.remove();
      overlay.remove();
    }, prefersReducedMotion ? 0 : 500);
    chrome.runtime.sendMessage({ action: 'setRemindLater', minutes: 10 });
  };  

  buttonsContainer.appendChild(okayButton);
  buttonsContainer.appendChild(remindButton);
  popup.appendChild(buttonsContainer);

  // Append to DOM
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Inject CSS animations once
  if (!document.querySelector('style[data-popup-style]')) {
    const popupStyle = document.createElement('style');
    popupStyle.setAttribute('data-popup-style', 'true');
    popupStyle.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -60%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
        to {
          opacity: 0;
          transform: translate(-50%, -60%);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(popupStyle);
  }
}

// Listen for background trigger
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showPopup") {
    createOrShowThePopup();
  }
});

