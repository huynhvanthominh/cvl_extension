const url = "https://blueprint.cyberlogitec.com.vn/";
const headers = new Headers();
const minTimePunchIn = "0700";
const maxTimePunchIn = "0829";
const minTimePunchOut = "1730";
const maxTimePunchOut = "1900";
const dateExpression = [];
const isAutoPunch = true;
const path = {
  getUserInfo: "api/getUserInfo",
  checkInOut: {
    insert: "api/checkInOut/insert",
    searchDailyAttendanceCheckInOut:
      "api/checkInOut/searchDailyAttendanceCheckInOut",
  },
};
chrome.runtime.onStartup.addListener(() => {
  chrome.cookies.getAll({ url }, (cookies) => {
    init(cookies).then();
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.cookies.getAll({ url }, (cookies) => {
    init(cookies).then();
  });
});

const init = async (cookies) => {
  headers.set("Cookie", cookies);
  headers.set("Content-Type", "application/json");
  headers.set(
    "User-Agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  );
  headers.set("Accept", "application/json, text/plain, */*");
  cronJobPunch();
};

const cronJobPunch = () => {
  mainFunction();
  setInterval(
    () => {
      mainFunction();
    },
    24 * 60 * 60 * 1000,
  );
};

const getDate = () => {
  const now = new Date();

  const dateMinPunchIn = new Date();
  const timeMinPunchIn = parseTimeString(minTimePunchIn);
  dateMinPunchIn.setHours(timeMinPunchIn.hours, timeMinPunchIn.minutes);

  const dateMinPunchOut = new Date();
  const timeMinPunchOut = parseTimeString(minTimePunchOut);
  dateMinPunchOut.setHours(timeMinPunchOut.hours, timeMinPunchOut.minutes);

  const dateMaxPunchIn = new Date();
  const timeMaxPunchIn = parseTimeString(maxTimePunchIn);
  dateMaxPunchIn.setHours(timeMaxPunchIn.hours, timeMaxPunchIn.minutes);

  const dateMaxPunchOut = new Date();
  const timeMaxPunchOut = parseTimeString(maxTimePunchOut);
  dateMaxPunchOut.setHours(timeMaxPunchOut.hours, timeMaxPunchOut.minutes);

  return {
    now,
    dateMinPunchIn,
    dateMaxPunchIn,
    dateMinPunchOut,
    dateMaxPunchOut,
  };
};

const mainFunction = () => {
  const { now, dateMinPunchIn, dateMinPunchOut } = getDate();

  const a = dateMinPunchIn.getTime() - now.getTime();
  const b = dateMinPunchOut.getTime() - now.getTime();

  if (a > 0) {
    setTimeout(() => {
      listPunch().then();
    }, a);
  }
  if (b > 0) {
    setTimeout(() => {
      listPunch().then();
    }, b);
  }
};

function parseTimeString(timeString) {
  if (timeString.length !== 4) {
    throw new Error("Invalid time string format. Expected format HHmm.");
  }

  const hours = parseInt(timeString.substring(0, 2), 10);
  const minutes = parseInt(timeString.substring(2, 4), 10);

  return { hours, minutes };
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = "01";
  return `${year}${month}${day}`;
};

const getDateWithFormatMMDDYYYY = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

const isEqualDate = (a, b) => {
  a = new Date(a);
  b = new Date(b);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isValidate = () => {
  const now = new Date();
  return !dateExpression.find((item) => isEqualDate(item, now));
};

const listPunch = async () => {
  if (!isValidate()) return;
  const {
    dateMinPunchIn,
    dateMaxPunchIn,
    dateMinPunchOut,
    dateMaxPunchOut,
    now,
  } = getDate();

  const wrkDt = getTodayDate();
  const payload = {
    wrkDt,
  };
  const rs = await fetch(
    url + path.checkInOut.searchDailyAttendanceCheckInOut,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
  ).then((rs) => rs.json());

  const { data } = rs;
  const { listDailyAttendance } = data;
  const dateToString = getDateWithFormatMMDDYYYY(now);
  const find = listDailyAttendance.find(
    (item) => item.wrkDt === dateToString && item.dyTpCd === "W",
  );
  if (find) {
    const start = new Date();
    const atndTms = find.atndTms;
    const timeStart = parseTimeString(atndTms);
    start.setHours(timeStart.hours, timeStart.minutes);

    const end = new Date();
    const lveTms = find.lveTms;
    const timeEnd = parseTimeString(lveTms);
    end.setHours(timeEnd.hours, timeEnd.minutes);

    if (
      isAutoPunch &&
      ((now >= dateMinPunchIn &&
        now <= dateMaxPunchIn &&
        (!atndTms || !(start >= dateMinPunchIn && start <= dateMaxPunchIn))) ||
        (now >= dateMinPunchOut &&
          now <= dateMaxPunchOut &&
          (!lveTms || !(end >= dateMinPunchOut && end <= dateMaxPunchOut))))
    ) {
      await punch();
    }
  }
};

const punch = async () => {
  const rs = await fetch(url + path.checkInOut.insert, {
    headers,
    method: "POST",
  }).then((rs) => rs.json());
  console.log("punch", rs);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action === "getFormValues") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // chrome.tabs.sendMessage(
      //   tabs[0].id,
      //   { action: "fetchFormValues" },
      //   (response) => {
      //     console.log(response);
      //     if (response && response.formValues) {
      //       chrome.storage.local.set(
      //         { formValues: response.formValues },
      //         () => {
      //           console.log("Form values saved:", response.formValues);
      //         },
      //       );
      //     }
      //     sendResponse(response); // Respond back to the popup
      //   },
      // );
    });

    return true;
  }

  if (message.action === "getSavedValues") {
    chrome.storage.local.get("formValues", (data) => {
      sendResponse({ formValues: data.formValues || {} });
    });
    return true;
  }
});

function setValueInStore(key, value) {
  chrome.storage.local.set({ [key]: value });
}

function getValueFromStore(key, callback) {
  chrome.storage.local.get([key], (result) => {
    if (chrome.runtime.lastError) {
      callback(null);
    } else {
      callback(result[key]);
    }
  });
}
