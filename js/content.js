alert(123);
const formId = "form-settings";
function getFormValues() {
  const f = document.getElementById(formId);
  console.log(f);
  const form = document.querySelector("form"); // Adjust selector to target specific form if needed
  console.log(form);
  if (!form) return null;

  // Collect form data
  const formData = {};
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    formData[input.name] = input.value; // Store each input's name and value
  });

  return formData; // Return the collected form data
}

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);

  if (message.action === "fetchFormValues") {
    const formValues = getFormValues(); // Fetch form values
    sendResponse({ formValues }); // Send back the form values
  }
});
