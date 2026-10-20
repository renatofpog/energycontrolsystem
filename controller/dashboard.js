import URL_API from "../services/config.js";

const gridEquipamentos = document.getElementById("equipamentos-grid");
const btnAdd = document.querySelector(".btn-add");
const modalCadastro = document.getElementById("modal-cadastro");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formCadastro = document.getElementById("form-cadastrar-equipamento");

function abrirModal() {
  modalCadastro.style.display = "flex";
}

function fecharModal() {
  modalCadastro.style.display = "none";
  formCadastro.reset();
}

btnAdd.addEventListener("click", abrirModal);
btnFecharModal.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);


window.addEventListener("click", (event) => {
  if (event.target === modalCadastro) {
    fecharModal();
  }
});

function obterBadgeConsumo(potencia, horasUso) {
  const consumoKwh = (potencia * horasUso) / 1000;
  if (consumoKwh >= 5) {
    return { classe: "alto", texto: "Alto Consumo" };
  } else if (consumoKwh >= 1.5) {
    return { classe: "medio", texto: "Médio Consumo" };
  } else {
    return { classe: "baixo", texto: "Baixo Consumo" };
  }
}

async function carregarEquipamentos() {
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${URL_API}/equipments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      data = [];
    }

    if (response.ok) {
      gridEquipamentos.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        gridEquipamentos.innerHTML = "<p>Nenhum equipamento cadastrado.</p>";
        return;
      }

      data.forEach((eq) => {
        const nome = eq.name_equipment || "Equipamento Sem Nome";
        const potencia = eq.power_watts || 0;
        const horasUso = eq.hours_per_day || 0;

        const badgeInfo = obterBadgeConsumo(potencia, horasUso);

        const card = document.createElement("div");
        card.className = "card-equipamento";
        card.innerHTML = `
          <div class="card-info">
            <h3>${nome}</h3>
            <p>Potência: ${potencia}W | Uso diário: ${horasUso}h</p>
          </div>

          <div class="card-actions-wrapper">
            <span class="badge-consumo ${badgeInfo.classe}">${badgeInfo.texto}</span>
            <div class="actions">
              <button class="btn-action btn-edit" data-id="${eq.id}">✏️ Editar</button>
              <button class="btn-action btn-delete" data-id="${eq.id}">🗑️ Excluir</button>
            </div>
          </div>
        `;

        gridEquipamentos.appendChild(card);
      });
    } else {
      gridEquipamentos.innerHTML = "<p>Erro ao carregar equipamentos.</p>";
    }
  } catch (error) {
    console.error("Erro ao buscar equipamentos:", error);
    gridEquipamentos.innerHTML = "<p>Servidor fora do ar!</p>";
  }
}

formCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name_equipment = document.getElementById("nome-eq").value;
  const power_watts = Number(document.getElementById("potencia-eq").value);
  const hours_per_day = Number(document.getElementById("horas-eq").value);
  const days_per_week = Number(document.getElementById("daysWeek-eq").value);
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${URL_API}/equipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },

      body: JSON.stringify({ name_equipment, power_watts, hours_per_day, days_per_week }),
    });

    if (response.ok) {
      fecharModal();
      carregarEquipamentos();
    } else {
      const errorText = await response.text();
      console.error("Erro da API:", errorText);
      alert("Erro ao cadastrar equipamento.");
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
    alert("Servidor fora do ar!");
  }
});

document.addEventListener("DOMContentLoaded", carregarEquipamentos);
