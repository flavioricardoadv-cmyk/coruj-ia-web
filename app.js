/* ═══════════════════════════════════════════════════════════════
   CORUJ IA WEB — app.js   (estilo SAJ, Claude API direto)
═══════════════════════════════════════════════════════════════ */

// ── MODELOS (árvore da sidebar) ──────────────────────────────
const MODELOS = [
  { area: "Família",
    itens: ["Fixação de alimentos", "Revisão de alimentos", "Execução de alimentos",
            "Busca e apreensão", "Pedido de audiência — provas",
            "Execução — intimação ficta (pessoal)", "Execução — intimação ficta (carta)",
            "Execução — pesquisas patrimoniais", "Prisão civil do devedor",
            "Partilha de bens", "Averiguação de paternidade"] },
  { area: "Interdição / Curatela",
    itens: ["Ciência de liminar e entrevista designada", "Autora inerte — possível extinção",
            "Necessidade de perícia/estudo social", "Manifestação após laudo",
            "Pedido de interdição total", "Levantamento de curatela"] },
  { area: "Mandado de Segurança",
    itens: ["Parecer pela denegação", "Parecer pela concessão",
            "Extinção por perda de objeto", "Recurso — agravo regimental"] },
  { area: "Obrigação de Fazer — Saúde",
    itens: ["Medicamento/tratamento urgente", "Internação compulsória",
            "Relatório médico insuficiente", "Cumprimento de sentença — saúde"] },
  { area: "Cível",
    itens: ["Usucapião — manifestação", "Ação possessória",
            "Danos morais — parecer", "Ação de indenização"] },
  { area: "Registro Público",
    itens: ["Retificação de registro", "Alteração de nome",
            "Assento de nascimento tardio", "Cancelamento de registro"] },
  { area: "Penal",
    itens: ["Denúncia criminal", "Aditamento de denúncia",
            "Alegações finais — condenação", "Alegações finais — absolvição",
            "Recurso de apelação", "HC — manifestação"] },
  { area: "Tutela Coletiva",
    itens: ["Ação civil pública — inicial", "Inquérito civil — arquivamento",
            "TAC — proposta", "Recomendação ministerial"] },
];

// ── PROMPTS ───────────────────────────────────────────────────
const PROMPTS = {
  resumo: (txt, modelo) => `
Você é um assistente jurídico do Ministério Público de Mato Grosso do Sul.
${modelo ? `Área / modelo selecionado: ${modelo}.` : ""}

Elabore um RESUMO OBJETIVO E ESTRUTURADO do texto processual:
1. **Identificação**: tipo de peça, número do processo, partes, juízo/vara.
2. **Síntese dos fatos**: cronologia em até 6 tópicos.
3. **Estado atual**: última movimentação e o que está pendente.
4. **Providência do MP**: qual ato deve ser praticado pelo Ministério Público.
Use linguagem técnico-jurídica com subtítulos em negrito.
TEXTO:\n${txt}`.trim(),

  "ultima-peca": (txt, modelo) => `
Você é assistente jurídico do MP-MS. Analise e informe:
1. **Última peça/movimentação**: qual foi, data, quem praticou.
2. **Natureza do ato**: despacho, decisão, sentença, petição, etc.
3. **Prazo para o MP**: há prazo correndo? Qual ato deve seguir?
4. **Prioridade**: 🔴 Urgente / 🟡 Normal / 🟢 Sem urgência — justifique.
TEXTO:\n${txt}`.trim(),

  modelo: (txt, modelo) => `
Você é assistente jurídico do MP-MS especialista em manifestações formais.
${modelo ? `Modelo solicitado: ${modelo}.` : "Determine o tipo pelo conteúdo."}

Elabore MINUTA COMPLETA DE MANIFESTAÇÃO DO MP:

**CABEÇALHO**
Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) [Vara/Comarca extrair do texto]
Processo nº [extrair ou deixar entre colchetes]

**I — RELATÓRIO**
Relato dos fatos e estado dos autos.
"É o relatório."

**II — ANÁLISE JURÍDICA**
Fundamentos legais, princípios constitucionais e jurisprudência do TJMS/STJ/STF.

**III — REQUERIMENTO**
Pedido claro, certo e delimitado.

"Termos em que pede deferimento."
Local/Data · [Promotor(a) de Justiça]

TEXTO DO PROCESSO:\n${txt}`.trim(),

  revisao: (txt, modelo) => `
Você é revisor jurídico sênior do MP-MS. Revise o texto e apresente:
1. **Clareza**: frases ambíguas, períodos longos, falta de foco.
2. **Formalidade**: termos coloquiais, construções inadequadas para o MP.
3. **Precisão técnica**: uso impreciso de termos, fundamentação fraca.
4. **Estrutura**: ausência de relatório, mérito, pedido, encerramento.
5. **Trechos corrigidos**: reescreva os 3 mais problemáticos.
6. **Nota final**: de 1 a 10 com parecer.
TEXTO:\n${txt}`.trim(),

  contradicoes: (txt, modelo) => `
Você é analista jurídico do MP especializado em inconsistências. Identifique:
1. **Contradições internas**: afirmações que se contradizem.
2. **Contradições jurídicas**: contrárias à lei ou jurisprudência.
3. **Inconsistências fáticas**: datas, nomes, valores incompatíveis.
4. **Lacunas argumentativas**: pontos sem suporte jurídico.
5. **Como resolver**: sugestão para cada problema.
TEXTO:\n${txt}`.trim(),

  fundamentos: (txt, modelo) => `
Você é pesquisador jurídico do MP-MS. Com base no texto, apresente:
1. **Dispositivos legais**: artigos da CF/88, Código Penal, Civil, ECA, CDC, etc.
2. **Princípios jurídicos**: constitucionais e processuais aplicáveis.
3. **Jurisprudência**: súmulas STF/STJ e tendência TJMS.
4. **Doutrina**: autores e obras relevantes.
5. **Estratégia argumentativa**: melhor linha para o MP e como estruturá-la.
TEXTO:\n${txt}`.trim(),
};

// ── PAISAGENS ─────────────────────────────────────────────────
const PAISAGENS = [
  { src: "landscapes/1.jpg", legenda: "Ilhas Flutuantes" },
  { src: "landscapes/2.jpg", legenda: "Floresta Encantada" },
  { src: "landscapes/3.jpg", legenda: "Montanhas em Flor" },
  { src: "landscapes/4.jpg", legenda: "Vale de Cristal" },
  { src: "landscapes/5.jpg", legenda: "Árvore da Vida" },
];
let paisagemIdx   = 0;
let paisagemTimer = null;

function iniciarPaisagem() {
  aplicarPaisagem();
  paisagemTimer = setInterval(() => {
    if (document.getElementById("landscapeArea").style.display === "none") return;
    const bg = document.getElementById("landscapeBg");
    bg.classList.add("fading");
    setTimeout(() => {
      paisagemIdx = (paisagemIdx + 1) % PAISAGENS.length;
      aplicarPaisagem();
      bg.classList.remove("fading");
    }, 900);
  }, 7000);
}

function aplicarPaisagem() {
  const { src, legenda } = PAISAGENS[paisagemIdx];
  document.getElementById("landscapeBg").style.backgroundImage = `url("${src}")`;
  document.getElementById("landscapeCaption").textContent = legenda;
}

// ── ESTADO ────────────────────────────────────────────────────
let modeloSelecionado = null;
let emExecucao = false;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderArvore();
  bindEvents();
  iniciarRelogio();
  iniciarPaisagem();
  if (!localStorage.getItem("coruj_api_key")) setTimeout(abrirConfig, 600);
});

// ── RELÓGIO ───────────────────────────────────────────────────
function iniciarRelogio() {
  function atualizar() {
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    const h = pad(now.getHours()), m = pad(now.getMinutes()), s = pad(now.getSeconds());
    const d = now.toLocaleDateString("pt-BR");
    document.getElementById("clockTime").textContent = `${h}:${m}:${s}`;
    document.getElementById("clockDate").textContent = d;
  }
  atualizar();
  setInterval(atualizar, 1000);
}

// ── ÁRVORE DE MODELOS ─────────────────────────────────────────
function renderArvore(filtro = "") {
  const tree  = document.getElementById("modelsTree");
  const lower = filtro.toLowerCase();
  tree.innerHTML = "";

  MODELOS.forEach((grupo, gi) => {
    const itensVisiveis = filtro
      ? grupo.itens.filter(i => i.toLowerCase().includes(lower) || grupo.area.toLowerCase().includes(lower))
      : grupo.itens;
    if (!itensVisiveis.length) return;

    const grpEl = document.createElement("div");
    grpEl.className = "area-group" + (gi === 0 || filtro ? " open" : "");

    const title = document.createElement("div");
    title.className = "area-title";
    title.textContent = grupo.area;
    title.addEventListener("click", () => grpEl.classList.toggle("open"));

    const list = document.createElement("div");
    list.className = "model-list";

    itensVisiveis.forEach(item => {
      const el = document.createElement("div");
      el.className = "model-item";
      el.textContent = item;
      el.addEventListener("click", () => selecionarModelo(grupo.area, item, el));
      list.appendChild(el);
    });

    grpEl.appendChild(title);
    grpEl.appendChild(list);
    tree.appendChild(grpEl);
  });
}

function selecionarModelo(area, titulo, el) {
  document.querySelectorAll(".model-item.active").forEach(e => e.classList.remove("active"));
  el.classList.add("active");
  modeloSelecionado = `${area} — ${titulo}`;
  document.getElementById("selectedModelName").textContent = titulo;
  document.getElementById("selectedModelArea").textContent = area;
  setStatus(`1 objeto selecionado — ${titulo}`);
}

// ── EVENTOS ───────────────────────────────────────────────────
function bindEvents() {
  // Busca na árvore
  document.getElementById("treeSearch").addEventListener("input", e => {
    renderArvore(e.target.value);
  });

  // Botões de ação (chips + owl menu)
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => executar(btn.dataset.action));
  });

  // Contador de caracteres
  const txt = document.getElementById("caseText");
  txt.addEventListener("input", () => {
    const n = txt.value.length;
    document.getElementById("charCount").textContent = n.toLocaleString("pt-BR") + " caracteres";
  });

  // PDF input
  document.getElementById("pdfInput").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === "text/plain") {
      const text = await file.text();
      document.getElementById("caseText").value = text;
    } else {
      mostrarToast("⚠️ Cole o texto manualmente. PDFs requerem extração prévia.");
    }
    e.target.value = "";
  });

  // Fechar owl menu ao clicar fora
  document.addEventListener("click", e => {
    const menu = document.getElementById("owlMenu");
    const btn  = document.getElementById("owlBtn");
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.hidden = true;
    }
  });

  // Fechar modal clicando no overlay
  document.getElementById("modalConfig").addEventListener("click", e => {
    if (e.target === e.currentTarget) fecharConfig();
  });
}

// ── EXECUTAR ANÁLISE ──────────────────────────────────────────
async function executar(action) {
  if (emExecucao) return;

  const texto = document.getElementById("caseText").value.trim();
  if (!texto) {
    mostrarToast("⚠️ Cole um texto antes de analisar.");
    return;
  }

  const apiKey = localStorage.getItem("coruj_api_key") || "";
  if (!apiKey) {
    abrirConfig();
    mostrarToast("🔑 Configure a chave da API Anthropic primeiro.");
    return;
  }

  const modelo    = localStorage.getItem("coruj_modelo")     || "claude-sonnet-4-5";
  const maxTokens = parseInt(localStorage.getItem("coruj_tokens") || "2048");
  const promptFn  = PROMPTS[action];
  if (!promptFn) return;

  emExecucao = true;
  document.querySelectorAll("[data-action]").forEach(b => b.disabled = true);
  document.getElementById("loadingBar").hidden = false;
  setResultado("⏳ Processando com " + modelo + "...");
  setStatus("Aguardando resposta da IA...");

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "x-api-key":       apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: modelo, max_tokens: maxTokens,
        messages: [{ role: "user", content: promptFn(texto, modeloSelecionado) }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const msg = err?.error?.message || `Erro HTTP ${resp.status}`;
      if (resp.status === 401) setResultado("❌ Chave de API inválida. Acesse ⚙️ Configurações da API.");
      else if (resp.status === 429) setResultado("⏱️ Limite atingido. Aguarde alguns segundos e tente novamente.");
      else setResultado(`❌ Erro ${resp.status}:\n${msg}`);
      return;
    }

    const data = await resp.json();
    const ans  = data?.content?.[0]?.text || "(sem resposta)";
    setResultado(ans);
    setStatus("Análise concluída — " + new Date().toLocaleTimeString("pt-BR"));
    mostrarToast("✅ Análise concluída!");

  } catch (err) {
    setResultado(`❌ Falha de conexão:\n${err.message}`);
  } finally {
    emExecucao = false;
    document.querySelectorAll("[data-action]").forEach(b => b.disabled = false);
    document.getElementById("loadingBar").hidden = true;
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function setResultado(texto) {
  const land = document.getElementById("landscapeArea");
  const el   = document.getElementById("resultado");
  if (!texto) {
    land.style.display = "";
    el.style.display   = "none";
    return;
  }
  land.style.display = "none";
  el.style.display   = "";
  el.innerHTML = "";
  el.textContent = texto;
}

function setStatus(msg) {
  document.getElementById("statusMain").textContent = msg;
}

function toggleOwlMenu() {
  const m = document.getElementById("owlMenu");
  m.hidden = !m.hidden;
}

function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3000);
}

function copiarResultado() {
  const txt = document.getElementById("resultado").textContent.trim();
  if (!txt || txt.startsWith("⏳") || txt.includes("Selecione")) {
    mostrarToast("Nenhum resultado para copiar."); return;
  }
  navigator.clipboard.writeText(txt)
    .then(() => mostrarToast("✅ Copiado!"))
    .catch(() => mostrarToast("Erro ao copiar."));
}

function baixarResultado() {
  const txt = document.getElementById("resultado").textContent.trim();
  if (!txt || txt.startsWith("⏳") || txt.includes("Selecione")) {
    mostrarToast("Nenhum resultado para baixar."); return;
  }
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `coruj-ia-${Date.now()}.txt` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  mostrarToast("📄 Download iniciado.");
}

// ── CONFIG ────────────────────────────────────────────────────
function abrirConfig() {
  document.getElementById("inputApiKey").value    = localStorage.getItem("coruj_api_key") || "";
  document.getElementById("selectModelo").value   = localStorage.getItem("coruj_modelo")  || "claude-sonnet-4-5";
  document.getElementById("inputMaxTokens").value = localStorage.getItem("coruj_tokens")  || "2048";
  document.getElementById("modalConfig").hidden   = false;
}
function fecharConfig() { document.getElementById("modalConfig").hidden = true; }
function salvarConfig() {
  const k = document.getElementById("inputApiKey").value.trim();
  if (!k) { mostrarToast("⚠️ Informe a chave da API."); return; }
  if (!k.startsWith("sk-ant-")) { mostrarToast("⚠️ Chave inválida — deve começar com sk-ant-"); return; }
  localStorage.setItem("coruj_api_key", k);
  localStorage.setItem("coruj_modelo",  document.getElementById("selectModelo").value);
  localStorage.setItem("coruj_tokens",  document.getElementById("inputMaxTokens").value);
  fecharConfig();
  mostrarToast("✅ Configurações salvas!");
}
