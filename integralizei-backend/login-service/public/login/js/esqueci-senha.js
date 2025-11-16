document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const emailField = document.getElementById("emailField");
  const successMessage = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const debugArea = document.getElementById("debugArea");
  const debugLink = document.getElementById("debugLink");

  function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    debugArea.classList.add("hidden");
  }

  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove("hidden");
    successMessage.classList.add("hidden");
    debugArea.classList.add("hidden");
  }

  function showDebugLink(link) {
    debugLink.href = link;
    debugLink.textContent = link;
    debugArea.classList.remove("hidden");
    successMessage.classList.remove("hidden");
    successText.textContent = "Simulação de e-mail: Clique no link abaixo para redefinir.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailField.value.trim();

    if (!email) {
      showError("Por favor, informe seu e-mail.");
      return;
    }

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Não foi possível processar a solicitação.");
        return;
      }

      // Sucesso!
      if (data.simulatedResetLink) {
        // Modo de simulação: Mostrar o link de debug
        showDebugLink(data.simulatedResetLink);
      } else {
        // Modo de "produção": Apenas mostrar a mensagem padrão
        showSuccess(data.message);
      }
      form.reset();

    } catch (err) {
      showError("Erro de rede. Tente novamente.");
    }
  });
});
