document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const passwordField = document.getElementById("passwordField");
  const confirmField = document.getElementById("confirmField");
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const formContent = document.getElementById("formContent");
  const loginLink = document.getElementById("loginLink");

  // 1. Pegar o token da URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    formContent.classList.add("hidden");
    loginLink.classList.remove("hidden");
  }

  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove("hidden");
    successMessage.classList.add("hidden");
  }

  // 2. Validar se o token existe
  if (!token) {
    showError("Token de redefinição não encontrado. Por favor, solicite um novo link.");
    formContent.classList.add("hidden");
    loginLink.classList.remove("hidden");
    return;
  }

  // 3. Adicionar listener ao formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const password = passwordField.value;
    const confirm = confirmField.value;

    if (password.length < 8) {
      showError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      showError("As senhas não conferem.");
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Não foi possível redefinir a senha. O token pode estar expirado.");
        return;
      }

      // Sucesso!
      showSuccess(data.message || "Senha redefinida com sucesso!");

    } catch (err) {
      console.error(err);
      showError("Erro de rede. Tente novamente.");
    }
  });
});
