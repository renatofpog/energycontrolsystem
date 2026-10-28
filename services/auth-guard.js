const token = localStorage.getItem("userToken");

if (!token) {
  window.location.href = "https://renatofpog.github.io/energycontrolsystem/";
}

export default function verificarTokenExpirado() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "https://renatofpog.github.io/energycontrolsystem/";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const payloadSegundos = Math.floor(Date.now() / 1000);

    if (payloadSegundos >= payload.exp) {
      alert("Sua sessão expirou. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "https://renatofpog.github.io/energycontrolsystem/";
    }
  } catch (e) {
    localStorage.removeItem("token");
    window.location.href = "https://renatofpog.github.io/energycontrolsystem/";
  }
}
