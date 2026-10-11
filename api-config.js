const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzyyb2EZpK9DTrv0o60Zxcb5q3PIWRyZ_cM9WBHOdpr04GwE0DIyEVVWiC_HqgLydY0/exec";
const API_KEY = "SUPER_SECRET_API_KEY_12345"; // Must match Code.gs API_KEY

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loginApi(password) {
  const pHash = await hashPassword(password);
  return sendSecureRequest('login', { passwordHash: pHash });
}

async function searchStudentsApi(data) {
  return sendSecureRequest('searchStudents', data);
}

async function markAttendance(data) {
  return sendSecureRequest('markAttendance', data);
}

async function registerStudentApi(data) {
  return sendSecureRequest('registerStudent', data);
}

async function sendSecureRequest(action, data) {
  try {
    const payload = {
      apiKey: API_KEY,
      action: action,
      data: data
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return { success: false, message: `Server HTTP ${response.status}` };
    return await response.json();
  } catch (err) {
    return { success: false, message: "Secure Network Connection Failed." };
  }
}
