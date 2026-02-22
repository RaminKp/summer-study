document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("startBtn").addEventListener("click", function() {
      logButtonPress("Start");
  });
});


function logButtonPress(buttonName) {
  fetch('/log/button-press/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          button_name: buttonName
      })
  }).then(response => response.json())
    .then(data => console.log('Button Press Logged:', data))
    .catch(error => console.error('Error logging button press:', error));
}
