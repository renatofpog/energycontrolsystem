import URL_API from "../services/config.js";

const formulario = document.getElementById("form-registro");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const passwordHash = document.getElementById("senha").value;

  try {
    const response = await fetch(`${URL_API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, passwordHash }),
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      data = { message: textResponse };
    }

    if (response.ok) {
      window.location.href = "https://renatofpog.github.io/energycontrolsystem/";
    } else {
      alert(data.message || "Erro erro ao se cadastrar.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Servidor fora do ar!");
  }
});