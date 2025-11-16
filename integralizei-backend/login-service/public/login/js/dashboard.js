document.addEventListener("DOMContentLoaded", async () => {
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const logoutButton = document.getElementById("logoutButton");

  try {
    const res = await fetch("/api/me");
    
    if (!res.ok) {
      window.location.href = "/index.html";
      return;
    }

    const user = await res.json();
    
    userNameEl.textContent = user.name || "Usuário";
    userEmailEl.textContent = user.email || "Não foi possível carregar o e-mail";

  } catch (err) {
    console.error("Erro ao buscar dados do usuário:", err);
    window.location.href = "/index.html";
  }

  logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/logout");
      window.location.href = "/index.html";
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  });
});
