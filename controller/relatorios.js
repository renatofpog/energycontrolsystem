import URL_API from "../services/config.js";


const cardConsumoTotal = document.querySelector(".metrics-grid .metric-card:nth-child(1) .metric-value");
const cardCustoEstimado = document.querySelector(".metrics-grid .metric-card:nth-child(2) .metric-value");
const cardMaisGastao = document.querySelector(".metrics-grid .metric-card:nth-child(3) .metric-value");
const containerChartBars = document.querySelector(".chart-bars");


const TARIFA_KWH = 0.85; 

async function carregarRelatorios() {
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
    let equipamentos = [];
    try {
      equipamentos = JSON.parse(textResponse);
    } catch (e) {
      equipamentos = [];
    }

    if (!response.ok || !Array.isArray(equipamentos) || equipamentos.length === 0) {
      exibirEstadoVazio();
      return;
    }

    let consumoTotalMensal = 0;
    let maiorConsumo = -1;
    let nomeMaisGastao = "Nenhum";
    let dadosProcessados = [];

    equipamentos.forEach((eq) => {
      const nome = eq.name_equipment || eq.name || "Sem Nome";
      const potencia = Number(eq.power_watts || eq.power || 0);
      const horasDia = Number(eq.hours_per_day || eq.dailyHours || 0);
      const diasSemana = Number(eq.days_per_week || eq.daysWeek || 0);

      const semanasNoMes = 4.33;
      const consumoMensalKwh = (potencia * horasDia * diasSemana * semanasNoMes) / 1000;

      consumoTotalMensal += consumoMensalKwh;

      if (consumoMensalKwh > maiorConsumo) {
        maiorConsumo = consumoMensalKwh;
        nomeMaisGastao = nome;
      }

      dadosProcessados.push({
        nome: nome,
        consumo: consumoMensalKwh
      });
    });

    const custoEstimado = consumoTotalMensal * TARIFA_KWH;

    if (cardConsumoTotal) cardConsumoTotal.textContent = `${consumoTotalMensal.toFixed(1)} kWh`;
    if (cardCustoEstimado) cardCustoEstimado.textContent = `R$ ${custoEstimado.toFixed(2).replace('.', ',')}`;
    if (cardMaisGastao) cardMaisGastao.textContent = nomeMaisGastao;

    dadosProcessados.sort((a, b) => b.consumo - a.consumo);

    if (containerChartBars) {
      containerChartBars.innerHTML = "";

      const maiorValorGrafico = dadosProcessados[0].consumo > 0 ? dadosProcessados[0].consumo : 1;

      dadosProcessados.forEach((item) => {
        const porcentagemLargura = (item.consumo / maiorValorGrafico) * 100;

        const barGroup = document.createElement("div");
        barGroup.className = "bar-group";
        barGroup.innerHTML = `
          <span>${item.nome} (${item.consumo.toFixed(1)} kWh)</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${porcentagemLargura}%"></div>
          </div>
        `;

        containerChartBars.appendChild(barGroup);
      });
    }

  } catch (error) {
    console.error("Erro ao carregar dados para o relatório:", error);
    exibirEstadoVazio();
  }
}

function exibirEstadoVazio() {
  if (cardConsumoTotal) cardConsumoTotal.textContent = "0 kWh";
  if (cardCustoEstimado) cardCustoEstimado.textContent = "R$ 0,00";
  if (cardMaisGastao) cardMaisGastao.textContent = "Nenhum";
  if (containerChartBars) {
    containerChartBars.innerHTML = "<p>Nenhum equipamento cadastrado para gerar relatório.</p>";
  }
}

document.addEventListener("DOMContentLoaded", carregarRelatorios);