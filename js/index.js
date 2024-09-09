document.addEventListener("DOMContentLoaded", function () {
  const btnSaveSettingId = "btn-save-setting";
  const getFormValues = () => {
    // Assuming there is a form with ID 'myForm'
    const form = document.querySelector("form"); // Select the form
    if (!form) return null; // If no form found, return null

    // Create an object to hold form data
    const formData = {};
    // Loop through each input, select, and textarea
    form.querySelectorAll("input, select, textarea").forEach((input) => {
      formData[input.name] = input.value; // Store the name and value
    });
    console.log(formData);
    return formData; // Return the collected form data
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message, sender, sendResponse);
    if (message.action === "getFormValues") {
      const formValues = getFormValues(); // Fetch form values
      sendResponse({ formValues }); // Send back the form values
    }
  });

  document.getElementById(btnSaveSettingId).addEventListener("click", () => {
    save();
  });

  const save = () => {
    chrome.runtime.sendMessage(
      { action: "getFormValues", data: getFormValues() },
      (response) => {
        console.log(response);
        // if (response && response.formValues) {
        //   alert(
        //     "Form values fetched and saved:\n" +
        //       JSON.stringify(response.formValues, null, 2),
        //   );
        // } else {
        //   alert("No form values found or unable to fetch.");
        // }
      },
    );
  };

  function setValueInStore(key, value) {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting value:", chrome.runtime.lastError);
      } else {
        console.log(`Value set: ${key} = ${value}`);
      }
    });
  }
});
