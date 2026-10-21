import URL_API from "../services/config.js";

const gridEquipamentos = document.getElementById("equipamentos-grid");
const btnAdd = document.querySelector(".btn-add");
const modalCadastro = document.getElementById("modal-cadastro");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formCadastro = document.getElementById("form-cadastrar-equipamento");
const modalTitulo = document.getElementById("modal-titulo");

// Elementos da Modal de Deleção
const modalDelecao = document.getElementById("modal-delecao");
const btnFecharModalDel = document.getElementById("btn-fechar-modal-del");
const btnCancelarDel = document.getElementById("btn-cancelar-del");
const btnConfirmarDel = document.getElementById("btn-confirmar-del");

let listaEquipamentosEmMemoria = [];
let idEquipamentoParaExcluir = null;

// FUNÇÕES DA MODAL DE CADASTRO
function abrirModalCadastro() {
  modalCadastro.style.display = "flex";
}

function fecharModalCadastro() {
  modalCadastro.style.display = "none";
  formCadastro.reset();
  if (modalTitulo) modalTitulo.textContent = "Cadastrar Novo Equipamento";
}

if (btnAdd) btnAdd.addEventListener("click", abrirModalCadastro);
if (btnFecharModal) btnFecharModal.addEventListener("click", fecharModalCadastro);
if (btnCancelar) btnCancelar.addEventListener("click", fecharModalCadastro);

// FUNÇÕES DA MODAL DE DELEÇÃO
function abrirModalDelecao(id) {
  idEquipamentoParaExcluir = id;
  if (modalDelecao) modalDelecao.style.display = "flex";
}

function fecharModalDelecao() {
  modalDelecao.style.display = "none";
  idEquipamentoParaExcluir = null;
}

if (btnFecharModalDel) btnFecharModalDel.addEventListener("click", fecharModalDelecao);
if (btnCancelarDel) btnCancelarDel.addEventListener("click", fecharModalDelecao);

// Fechar modais ao clicar fora do conteúdo
window.addEventListener("click", (event) => {
  if (event.target === modalCadastro) {
    fecharModalCadastro();
  }
  if (event.target === modalDelecao) {
    fecharModalDelecao();
  }
});

// OBTER CONSUMO
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


function extrairId(eq) {
  return eq.idEquipments ?? eq.id_equipment ?? eq.idEquipment ?? eq.id;
}

// MÉTODO CARREGAR EQUIPAMENTOS
async function carregarEquipamentos() {
  const token = localStorage.getItem("userToken");

  try {
    const response = await fetch(`${URL_API}/equipments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const textResponse = await response.text();
    try {
      listaEquipamentosEmMemoria = JSON.parse(textResponse);
    } catch (e) {
      listaEquipamentosEmMemoria = [];
    }

    if (response.ok) {
      gridEquipamentos.innerHTML = "";

      if (!Array.isArray(listaEquipamentosEmMemoria) || listaEquipamentosEmMemoria.length === 0) {
        gridEquipamentos.innerHTML = "<p>Nenhum equipamento cadastrado.</p>";
        return;
      }

      listaEquipamentosEmMemoria.forEach((eq, index) => {
        const id = extrairId(eq);
        const name_equipment = eq.name_equipment || eq.name || "Equipamento Sem Nome";
        const power_watts = eq.power_watts || eq.power || 0;
        const hours_per_day = eq.hours_per_day || eq.dailyHours || 0;
        const days_per_week = eq.days_per_week || eq.daysWeek || 0;

        const badgeInfo = obterBadgeConsumo(power_watts, hours_per_day);

        const card = document.createElement("div");
        card.className = "card-equipamento";
        card.innerHTML = `
          <div class="card-info">
            <h3>${name_equipment}</h3>
            <p>Potência: ${power_watts}W | Uso diário: ${hours_per_day}h | ${days_per_week} dias/sem</p>
          </div>

          <div class="card-actions-wrapper">
            <span class="badge-consumo ${badgeInfo.classe}">${badgeInfo.texto}</span>
            <div class="actions">
              <button type="button" class="btn-action btn-edit" data-index="${index}">✏️ Editar</button>
              <button type="button" class="btn-action btn-delete" data-index="${index}">🗑️ Excluir</button>
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

gridEquipamentos.addEventListener("click", (event) => {
  const btnDelete = event.target.closest(".btn-delete");

  if (btnDelete) {
    const indexStr = btnDelete.getAttribute("data-index");
    const index = Number(indexStr);
    const eqObj = listaEquipamentosEmMemoria[index];

    const id = eqObj ? extrairId(eqObj) : null;

    if (id !== null && id !== undefined) {
      abrirModalDelecao(id);
    } else {
      alert("Erro: ID do equipamento não encontrado.");
    }
  }
});

if (btnConfirmarDel) {
  btnConfirmarDel.addEventListener("click", async () => {
    if (!idEquipamentoParaExcluir) return;

    const token = localStorage.getItem("userToken");

    try {
      const response = await fetch(`${URL_API}/equipments/${Number(idEquipamentoParaExcluir)}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        fecharModalDelecao();
        carregarEquipamentos();
      } else {
        alert("Erro ao excluir o equipamento.");
      }
    } catch (error) {
      console.error("Erro de conexão ao deletar:", error);
      alert("Servidor fora do ar!");
    }
  });
}

// MÉTODO CADASTRAR EQUIPAMENTO
async function cadastrarEquipamento(dados) {
  const token = localStorage.getItem("userToken");

  const response = await fetch(`${URL_API}/equipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(dados),
  });

  return response;
}

formCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name_equipment = document.getElementById("nome-eq").value;
  const power_watts = Number(document.getElementById("potencia-eq").value);
  const hours_per_day = Number(document.getElementById("horas-eq").value);
  const days_per_week = Number(document.getElementById("daysWeek-eq").value);

  const dadosEquipamento = {
    name_equipment,
    power_watts,
    hours_per_day,
    days_per_week,
  };

  try {
    const response = await cadastrarEquipamento(dadosEquipamento);

    if (response.ok) {
      fecharModalCadastro();
      carregarEquipamentos();
    } else {
      const errorText = await response.text();
      console.error("Erro da API:", errorText);
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
});

document.addEventListener("DOMContentLoaded", carregarEquipamentos);