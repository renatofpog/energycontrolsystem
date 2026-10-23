const token = localStorage.getItem("userToken");

if (!token) {
  window.location.href = "https://renatofpog.github.io/energycontrolsystem/";
}