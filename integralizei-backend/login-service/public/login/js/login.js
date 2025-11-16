document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginField = document.getElementById("loginField");
  const passwordField = document.getElementById("passwordField");
  const errorMessage = document.getElementById("errorMessage");
  const googleLogin = document.getElementById("googleLogin");

  function showError(message, fields = []) {
    errorMessage.querySelector("p").textContent = message;
    errorMessage.classList.remove("hidden");
    fields.forEach((el) => el.classList.add("input-error"));
  }
  function hideError() {
    errorMessage.classList.add("hidden");
    [loginField, passwordField].forEach(el => el.classList.remove("input-error"));
  }

  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('error')) {
    showError("Falha ao autenticar com Google. Tente novamente.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); 
    hideError();
    
    const payload = {
      email: loginField.value.trim(),
      password: passwordField.value
    };

    if (!payload.email || !payload.password) {
      showError("Informe e-mail e senha.", [!payload.email?loginField:null, !payload.password?passwordField:null].filter(Boolean));
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.message || "Falha no login.");
        return;
      }
      window.location.href = "/dashboard.html";
      
    } catch (err) {
      showError("Erro de rede. Tente novamente.");
    }
  });

  googleLogin.addEventListener("click", () => {
    window.location.href = "/auth/google";
  });

  [loginField, passwordField].forEach(el => el.addEventListener("input", hideError));
});
