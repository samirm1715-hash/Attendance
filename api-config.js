const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXfZNSQ2BsVoSHDCoRZ9TX7fOst_iUmwc-OkO0LoVPancEIZjw-dbMxfDki7JEBFFt/exec";
const API_KEY = "SUPER_SECRET_API_KEY_12345"; // Must match Code.gs API_KEY


async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function loginApi(password) {
  const passwordHash = await hashPassword(password);

  const result = await sendSecureRequest("login", {
    passwordHash
  });

  if (result.success && result.sessionToken) {
    sessionStorage.setItem("sessionToken", result.sessionToken);
    sessionStorage.setItem("userRole", result.role);
  }

  return result;
}

async function searchStudentsApi(data) {
  return sendSecureRequest("searchStudents", data);
}

async function markAttendance(data) {
  return sendSecureRequest("markAttendance", data);
}

async function registerStudentApi(data) {
  return sendSecureRequest("registerStudent", data);
}

async function getClassesApi() {
  return sendSecureRequest("getClasses", {});
}

async function logoutApi() {
  try {
    return await sendSecureRequest("logout", {});
  } finally {
    sessionStorage.removeItem("sessionToken");
    sessionStorage.removeItem("userRole");
  }
}

async function sendSecureRequest(action, data = {}) {
  try {
    const payload = {
      apiKey: API_KEY,
      action,
      data: {
        ...data
      }
    };

    if (action !== "login") {
      const token = sessionStorage.getItem("sessionToken");

      if (!token) {
        return {
          success: false,
          code: "SESSION_EXPIRED",
          message: "Please log in again."
        };
      }

      payload.data.sessionToken = token;
    }

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Server request failed (HTTP " + response.status + ")."
      };
    }

    const result = await response.json();

    if (result.code === "SESSION_EXPIRED") {
      sessionStorage.removeItem("sessionToken");
      sessionStorage.removeItem("userRole");
    }

    return result;
  } catch (error) {
    console.error("API request failed:", error);

    return {
      success: false,
      message: "Unable to contact the server. Please try again."
    };
  }
}
