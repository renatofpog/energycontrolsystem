import URL_API from "../services/config.js";

const formulario = document.getElementById("form-login");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const passwordHash = document.getElementById("senha").value;

  try {
    const response = await fetch(`${URL_API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, passwordHash }),
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      data = { message: textResponse };
    }

    if (response.ok) {
      localStorage.setItem("userToken", data.token);

      window.location.href = "./dashboard.html";
    } else {
      alert(data.message || "Erro ao fazer login");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Servidor fora do ar!");
  }
});