const CONFIG = {
  launchDate: "2026-07-13T10:00:00+05:30",
  offerEnds: "2026-08-13T23:59:59+05:30"
};

const launchTime = new Date(CONFIG.launchDate).getTime();
const countdown = document.getElementById("countdown");
const modal = document.getElementById("notifyModal");
const openModalButton = document.getElementById("openModal");
const form = document.getElementById("notifyForm");
const phoneInput = document.getElementById("phone");
const error = document.getElementById("formError");

function updateCountdown() {
  const distance = Math.max(0, launchTime - Date.now());
  const units = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000)
  };

  Object.entries(units).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value).padStart(2, "0");
  });

  if (distance === 0) {
    countdown.innerHTML = "<div class=\"launched\"><strong>We are open!</strong><span>Come taste the new frontier</span></div>";
  }
}

function setModal(isOpen) {
  modal.hidden = !isOpen;
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (isOpen) setTimeout(() => phoneInput.focus(), 50);
}

openModalButton.addEventListener("click", () => setModal(true));
modal.querySelectorAll("[data-close]").forEach((element) => {
  element.addEventListener("click", () => setModal(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) setModal(false);
});

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/[^\d\s-]/g, "");
  error.textContent = "";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const digits = phoneInput.value.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    error.textContent = "Please enter a valid mobile number.";
    return;
  }

  const fullNumber = `${document.getElementById("countryCode").value}${digits}`;
  const submitButton = form.querySelector("button[type=\"submit\"]");
  submitButton.disabled = true;
  submitButton.textContent = "Registering...";

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullNumber })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed.");

    form.innerHTML = `
      <div class="success-message" role="status">
        <strong>You're on the list!</strong>
        <p>We will message you on WhatsApp when New Frontier Bakery launches.</p>
        <button class="submit-button" type="button" id="doneButton">Done</button>
      </div>
    `;
    document.getElementById("doneButton").addEventListener("click", () => setModal(false));
  } catch (requestError) {
    error.textContent = location.protocol === "file:"
      ? "Please open this page through the bakery server, not as a local file."
      : requestError.message;
    submitButton.disabled = false;
    submitButton.innerHTML = "Submit my number <span>&rarr;</span>";
  }
});

updateCountdown();
setInterval(updateCountdown, 1000);
