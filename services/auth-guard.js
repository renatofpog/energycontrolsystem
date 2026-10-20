const token = localStorage.getItem("userToken");

if (!token) {
  window.location.href = "../index.html";
}