document.addEventListener('DOMContentLoaded', () => {
  const hourSelect = document.getElementById('hours');
  const minuteSelect = document.getElementById('minutes');
  const saveButton = document.getElementById('save');
  const confirmation = document.getElementById('confirmationMessage');

  if (!hourSelect || !minuteSelect) {
    console.error("⚠️ Could not find hour/minute select elements.");
    return;
  }

  // Populate hours
  for (let i = 0; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = String(i).padStart(2, '0');
    hourSelect.appendChild(option);
  }

  // Populate minutes
  for (let i = 0; i < 60; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = String(i).padStart(2, '0');
    minuteSelect.appendChild(option);
  }
  // Load saved interval
  chrome.storage.sync.get(['interval'], (result) => {
    const total = result.interval || 120;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    hourSelect.value = hours;
    minuteSelect.value = minutes;
  });

  // Save selected time and show confirmation
  saveButton.addEventListener('click', () => {
    const hours = parseInt(hourSelect.value, 10) || 0;
    const minutes = parseInt(minuteSelect.value, 10) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes > 0) {
      // Save to storage and start timer
      chrome.storage.sync.set({ interval: totalMinutes }, () => {
        // Explicitly start the timer
        chrome.runtime.sendMessage({ 
          action: "startNewTimer", 
          interval: totalMinutes 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error starting timer:", chrome.runtime.lastError);
            alert("Error setting timer. Please try again.");
          } else if (response && response.success) {
            // Show confirmation
            if (confirmation) {
              confirmation.style.display = 'block';
              confirmation.textContent = `Timer set for ${hours}h ${minutes}m`;
              setTimeout(() => {
                confirmation.style.display = 'none';
              }, 2000);
            }
          }
        });
      });
    } else {
      alert("Please select a valid time.");
    }
  });
});
