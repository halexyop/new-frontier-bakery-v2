const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const rows = document.getElementById("registrationRows");
const emptyState = document.getElementById("emptyState");
const total = document.getElementById("total");
let adminPassword = sessionStorage.getItem("nfbAdminPassword") || "";

function authHeaders() {
  return { Authorization: `Bearer ${adminPassword}` };
}

function render(registrations) {
  rows.replaceChildren();
  total.textContent = registrations.length;
  emptyState.hidden = registrations.length !== 0;

  registrations.forEach((registration) => {
    const row = document.createElement("tr");
    const numberCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const link = document.createElement("a");

    numberCell.textContent = registration.phone;
    dateCell.textContent = new Date(registration.createdAt).toLocaleString("en-IN");
    link.href = `https://wa.me/${registration.phone.replace(/\D/g, "")}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Message on WhatsApp";
    actionCell.append(link);
    row.append(numberCell, dateCell, actionCell);
    rows.append(row);
  });
}

async function loadDashboard() {
  loginError.textContent = "";
  const response = await fetch("/api/admin/registrations", { headers: authHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to open dashboard.");

  sessionStorage.setItem("nfbAdminPassword", adminPassword);
  loginCard.hidden = true;
  dashboard.hidden = false;
  render(data.registrations);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminPassword = passwordInput.value;
  try {
    await loadDashboard();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

document.getElementById("refreshButton").addEventListener("click", () => {
  loadDashboard().catch((error) => { loginError.textContent = error.message; });
});

document.getElementById("logoutButton").addEventListener("click", () => {
  sessionStorage.removeItem("nfbAdminPassword");
  adminPassword = "";
  passwordInput.value = "";
  dashboard.hidden = true;
  loginCard.hidden = false;
});

document.getElementById("exportButton").addEventListener("click", async () => {
  const response = await fetch("/api/admin/export", { headers: authHeaders() });
  if (!response.ok) return;
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "new-frontier-registrations.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

if (adminPassword) {
  loadDashboard().catch(() => {
    sessionStorage.removeItem("nfbAdminPassword");
    adminPassword = "";
  });
}
