// auth.js
const API_BASE_URL = "https://amiable-playfulness-production.up.railway.app/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const msg = document.getElementById("loginMessage");
      msg.classList.add("hidden");
      try {
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          msg.textContent = "Login berhasil!";
          msg.className = "mb-4 p-2 rounded text-sm bg-green-100 text-green-800";
          setTimeout(() => { window.location.href = "index.html"; }, 1000);
        } else {
          msg.textContent = data.error || "Login gagal";
          msg.className = "mb-4 p-2 rounded text-sm bg-red-100 text-red-800";
        }
        msg.classList.remove("hidden");
      } catch (err) {
        msg.textContent = "Terjadi kesalahan jaringan.";
        msg.className = "mb-4 p-2 rounded text-sm bg-red-100 text-red-800";
        msg.classList.remove("hidden");
      }
    });
  }

  // REGISTER
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const msg = document.getElementById("registerMessage");
      msg.classList.add("hidden");
      try {
        const res = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          msg.textContent = "Registrasi berhasil! Silakan login.";
          msg.className = "mb-4 p-2 rounded text-sm bg-green-100 text-green-800";
          setTimeout(() => { window.location.href = "login.html"; }, 1200);
        } else {
          msg.textContent = data.error || "Registrasi gagal";
          msg.className = "mb-4 p-2 rounded text-sm bg-red-100 text-red-800";
        }
        msg.classList.remove("hidden");
      } catch (err) {
        msg.textContent = "Terjadi kesalahan jaringan.";
        msg.className = "mb-4 p-2 rounded text-sm bg-red-100 text-red-800";
        msg.classList.remove("hidden");
      }
    });
  }
});
