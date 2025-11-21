document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const nameField = document.getElementById("nameField");
  const emailField = document.getElementById("emailField");
  const passwordField = document.getElementById("passwordField");
  const confirmField = document.getElementById("confirmField");
  const regError = document.getElementById("regError");

  function showError(message, fields = []) {
    regError.querySelector("p").textContent = message;
    regError.classList.remove("hidden");
    fields.forEach((el) => el.classList.add("input-error"));
  }
  function hideError() {
    regError.classList.add("hidden");
    [nameField, emailField, passwordField, confirmField].forEach(el => el.classList.remove("input-error"));
  }

  form.addEventListener("submit", async (e) => {
    // --- ESTA É A CORREÇÃO ---
    // Impede que o formulário seja enviado da forma tradicional (que causava o erro)
    e.preventDefault(); 
    
    hideError();
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const password = passwordField.value;
    const confirm = confirmField.value;

    if (!name || !email || !password || !confirm) {
      showError("Preencha todos os campos.", [!name?nameField:null, !email?emailField:null, !password?passwordField:null, !confirm?confirmField:null].filter(Boolean));
      return;
    }
    if (password.length < 8) {
      showError("A senha deve ter pelo menos 8 caracteres.", [passwordField]);
      return;
    }
    if (password !== confirm) {
      showError("As senhas não conferem.", [passwordField, confirmField]);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.message || "Não foi possível cadastrar.");
        return;
      }
      
      // Redireciona para a página de login com um parâmetro
      window.location.href = "/index.html?registered=1";
    } catch (err) {
      console.error(err);
      showError("Erro de rede. Tente novamente.");
    }
  });

  [nameField, emailField, passwordField, confirmField].forEach(el => el.addEventListener("input", hideError));
});