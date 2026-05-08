/* ═══════════════════════════════════════════════════════════════
   CORUJ IA — app.js
   Versão web pública · GitHub Pages
   Chama a API Anthropic diretamente do navegador
   API key: localStorage("coruj_api_key")
═══════════════════════════════════════════════════════════════ */

// ── MATÉRIAS ─────────────────────────────────────────────────
const MATERIAS = [
  { cod: "TODAS", label: "Todas as matérias", cor: "#64748b" },
  { cod: "FAM",   label: "Família",            cor: "#e53e3e" },
  { cod: "EXE",   label: "Execução",           cor: "#dd6b20" },
  { cod: "CRI",   label: "Criminal",           cor: "#805ad5" },
  { cod: "INF",   label: "Infância e Juventude", cor: "#38a169" },
  { cod: "CIV",   label: "Cível",              cor: "#3182ce" },
  { cod: "TUT",   label: "Tutela Coletiva",    cor: "#00b5d8" },
  { cod: "JUR",   label: "Tribunal do Júri",   cor: "#d53f8c" },
  { cod: "HAB",   label: "Habeas Corpus",      cor: "#b7791f" },
  { cod: "CAU",   label: "Cautelares",         cor: "#2f855a" },
  { cod: "CON",   label: "Controle Externo",   cor: "#553c9a" },
];

// ── PROMPTS POR AÇÃO ─────────────────────────────────────────
const PROMPTS = {

  resumo: (txt, mat) => `
Você é um assistente jurídico especializado do Ministério Público de Mato Grosso do Sul.
${mat !== "TODAS" ? `Área de atuação: ${mat}.` : ""}

Elabore um RESUMO OBJETIVO E ESTRUTURADO do texto processual abaixo.
O resumo deve conter:
1. **Identificação**: tipo de peça, número do processo (se houver), partes, juízo/vara.
2. **Síntese dos fatos**: cronologia dos eventos relevantes em até 6 tópicos.
3. **Estado atual**: qual a última movimentação e o que está pendente.
4. **Ponto central para o MP**: qual providência ou manifestação se espera do Ministério Público.

Use linguagem técnico-jurídica, concisa, com subtítulos em negrito.

TEXTO:
${txt}
`.trim(),

  "ultima-peca": (txt, mat) => `
Você é um assistente jurídico do Ministério Público.
${mat !== "TODAS" ? `Área: ${mat}.` : ""}

Analise o texto abaixo e responda:
1. **Última peça/movimentação**: qual foi, data (se houver), quem praticou.
2. **Natureza do ato**: despacho, decisão interlocutória, sentença, petição, manifestação ministerial, etc.
3. **Prazo pendente para o MP**: há algum prazo correndo? Qual ato deve ser praticado em seguida?
4. **Prioridade sugerida**: 🔴 Urgente / 🟡 Normal / 🟢 Sem urgência — justifique.

Se não for possível identificar com certeza, indique a incerteza e apresente o mais provável.

TEXTO:
${txt}
`.trim(),

  modelo: (txt, mat) => `
Você é um assistente jurídico do Ministério Público de Mato Grosso do Sul, especialista em elaboração de manifestações formais.
${mat !== "TODAS" ? `Área de atuação: ${mat}.` : "Determine a área pelo conteúdo do texto."}

Com base no texto processual abaixo, elabore uma MINUTA COMPLETA DE MANIFESTAÇÃO DO MP com a seguinte estrutura:

**CABEÇALHO**
Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) [Vara/Comarca extrair do texto se possível]
Processo nº [extrair do texto ou deixar entre colchetes]

**I — RELATÓRIO**
Breve relato dos fatos e do estado dos autos.
Encerre com: "É o relatório."

**II — ANÁLISE JURÍDICA**
Fundamentos legais e doutrinários pertinentes.
Cite artigos da lei, princípios constitucionais e jurisprudência do TJMS/STJ/STF quando aplicável.

**III — REQUERIMENTO**
Pedido claro, certo, delimitado e fundamentado.

**ENCERRAMENTO**
"Termos em que pede deferimento."
Local/Data · [Promotor(a) de Justiça]

Adapte o modelo ao tipo de caso identificado. Use linguagem formal do MPMS.

TEXTO DO PROCESSO:
${txt}
`.trim(),

  revisao: (txt, mat) => `
Você é um revisor jurídico sênior do Ministério Público.
${mat !== "TODAS" ? `Área: ${mat}.` : ""}

Revise o texto jurídico abaixo e apresente relatório detalhado:

1. **Clareza e objetividade**: frases ambíguas, períodos excessivamente longos, falta de foco.
2. **Formalidade**: termos coloquiais, construções inadequadas para manifestações do MP.
3. **Precisão técnico-jurídica**: uso impreciso de termos, classificações incorretas, fundamentação fraca ou ausente.
4. **Estrutura**: ausência de relatório, mérito ou pedido; encerramento incorreto.
5. **Trechos corrigidos**: reescreva os 3 trechos mais problemáticos com a versão melhorada.
6. **Avaliação geral**: nota de 1 a 10 e parecer sintético de 2 linhas.

Seja objetivo, técnico e construtivo.

TEXTO:
${txt}
`.trim(),

  contradicoes: (txt, mat) => `
Você é um analista jurídico especializado em identificar inconsistências em peças processuais.
${mat !== "TODAS" ? `Área: ${mat}.` : ""}

Analise o texto abaixo e identifique:
1. **Contradições internas**: afirmações que se contradizem dentro do próprio texto.
2. **Contradições jurídicas**: afirmações contrárias à lei, jurisprudência consolidada ou lógica processual.
3. **Inconsistências fáticas**: datas, nomes, valores ou circunstâncias incompatíveis entre si.
4. **Lacunas argumentativas**: pontos sem suporte jurídico ou fático adequado.
5. **Como resolver**: sugestão objetiva para cada problema encontrado.

Se não houver contradições evidentes, diga explicitamente e aponte os pontos que merecem atenção preventiva.

TEXTO:
${txt}
`.trim(),

  fundamentos: (txt, mat) => `
Você é um pesquisador jurídico do Ministério Público especializado em fundamentação legal.
${mat !== "TODAS" ? `Área: ${mat}.` : "Determine a área pelo contexto."}

Com base no texto, identifique e explique os FUNDAMENTOS JURÍDICOS APLICÁVEIS:

1. **Dispositivos legais**: artigos da CF/88, Código Penal, Código Civil, ECA, CDC, CPP, CPC e legislação especial.
2. **Princípios jurídicos**: princípios constitucionais e processuais relevantes ao caso.
3. **Jurisprudência**: súmulas do STF/STJ e tendência do TJMS sobre a matéria.
4. **Doutrina**: autores e obras relevantes para fundamentação da manifestação.
5. **Estratégia argumentativa**: qual linha é mais forte para o MP e como estruturá-la.

Cite os dispositivos exatos (artigo, parágrafo, inciso).

TEXTO:
${txt}
`.trim(),

};

// ── ESTADO ───────────────────────────────────────────────────
let materiaAtiva = "TODAS";
let emExecucao   = false;

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderMaterias();
  bindEvents();
  // Abre config automaticamente se não tiver chave
  if (!localStorage.getItem("coruj_api_key")) {
    setTimeout(abrirConfig, 700);
  }
});

// ── MATÉRIAS ─────────────────────────────────────────────────
function renderMaterias() {
  const lista = document.getElementById("listaMaterias");
  lista.innerHTML = "";
  MATERIAS.forEach(m => {
    const li  = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "materia-pill" + (m.cod === materiaAtiva ? " active" : "");
    btn.innerHTML = `<span class="materia-dot" style="background:${m.cor}"></span>${m.label}`;
    btn.addEventListener("click", () => {
      materiaAtiva = m.cod;
      renderMaterias();
    });
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

// ── EVENTOS ──────────────────────────────────────────────────
function bindEvents() {
  // Chips e menu items
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => executar(btn.dataset.action));
  });

  // Contador de caracteres
  const textarea = document.getElementById("textoProcesso");
  const counter  = document.getElementById("charCount");
  textarea.addEventListener("input", () => {
    const n = textarea.value.length;
    counter.textContent = n.toLocaleString("pt-BR") + " caracteres";
    counter.style.color = n > 50000 ? "#e53e3e" : "";
  });

  // Fechar menu ao clicar fora
  document.addEventListener("click", e => {
    const menu = document.getElementById("corujaMenu");
    const fab  = document.getElementById("corujaBtn");
    if (!menu.hidden && !menu.contains(e.target) && !fab.contains(e.target)) {
      menu.hidden = true;
    }
  });

  // Fechar modal clicando no overlay
  document.getElementById("modalConfig").addEventListener("click", e => {
    if (e.target === e.currentTarget) fecharConfig();
  });
}

// ── EXECUTAR ANÁLISE ─────────────────────────────────────────
async function executar(action) {
  if (emExecucao) return;

  const texto = document.getElementById("textoProcesso").value.trim();
  if (!texto) {
    mostrarToast("⚠️ Cole um texto antes de analisar.");
    return;
  }
  if (texto.length < 30) {
    mostrarToast("⚠️ Texto muito curto para análise.");
    return;
  }

  const apiKey = localStorage.getItem("coruj_api_key") || "";
  if (!apiKey) {
    abrirConfig();
    mostrarToast("🔑 Configure sua chave da API Anthropic primeiro.");
    return;
  }

  const modelo    = localStorage.getItem("coruj_modelo")     || "claude-sonnet-4-5";
  const maxTokens = parseInt(localStorage.getItem("coruj_tokens") || "2048", 10);
  const promptFn  = PROMPTS[action];
  if (!promptFn) return;

  // ── UI: estado loading
  emExecucao = true;
  fecharMenu();
  setResultado("⏳ Analisando com a Coruj IA...\n\nProcessando o texto com " + modelo + "...");
  document.getElementById("loadingBar").hidden = false;
  document.querySelectorAll(".chip, .menu-item").forEach(b => b.disabled = true);

  try {
    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "x-api-key":      apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model:      modelo,
        max_tokens: maxTokens,
        messages: [{
          role:    "user",
          content: promptFn(texto, materiaAtiva),
        }],
      }),
    });

    if (!resposta.ok) {
      const err = await resposta.json().catch(() => ({}));
      const msg = err?.error?.message || `Erro HTTP ${resposta.status}`;
      if (resposta.status === 401) {
        setResultado("❌ Chave de API inválida ou expirada.\n\nAbra ⚙️ Configurar API e verifique a chave.");
      } else if (resposta.status === 429) {
        setResultado("⏱️ Limite de requisições atingido. Aguarde alguns segundos e tente novamente.");
      } else if (resposta.status === 400) {
        setResultado(`❌ Requisição inválida:\n${msg}`);
      } else {
        setResultado(`❌ Erro na API Anthropic (${resposta.status}):\n${msg}`);
      }
      return;
    }

    const dados  = await resposta.json();
    const answer = dados?.content?.[0]?.text || "(sem resposta)";
    setResultado(answer);
    mostrarToast("✅ Análise concluída!");

  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      setResultado("❌ Falha de conexão.\n\nVerifique sua conexão com a internet e tente novamente.");
    } else {
      setResultado(`❌ Erro inesperado:\n${err.message}`);
    }
  } finally {
    emExecucao = false;
    document.getElementById("loadingBar").hidden = true;
    document.querySelectorAll(".chip, .menu-item").forEach(b => b.disabled = false);
  }
}

// ── UI HELPERS ────────────────────────────────────────────────
function setResultado(texto) {
  const el = document.getElementById("resultado");
  el.innerHTML  = "";
  el.textContent = texto;
}

function toggleMenu() {
  const menu = document.getElementById("corujaMenu");
  menu.hidden = !menu.hidden;
}

function fecharMenu() {
  document.getElementById("corujaMenu").hidden = true;
}

function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3200);
}

// ── COPIAR / BAIXAR ───────────────────────────────────────────
function copiarResultado() {
  const texto = document.getElementById("resultado").textContent.trim();
  if (!texto || texto.startsWith("Selecione") || texto.startsWith("⏳")) {
    mostrarToast("Nenhum resultado para copiar.");
    return;
  }
  navigator.clipboard.writeText(texto)
    .then(()  => mostrarToast("✅ Copiado para a área de transferência!"))
    .catch(()  => mostrarToast("Erro ao copiar. Selecione o texto manualmente."));
}

function baixarResultado() {
  const texto = document.getElementById("resultado").textContent.trim();
  if (!texto || texto.startsWith("Selecione") || texto.startsWith("⏳")) {
    mostrarToast("Nenhum resultado para baixar.");
    return;
  }
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `coruj-ia-analise-${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

function fecharConfig() {
  document.getElementById("modalConfig").hidden = true;
}

function salvarConfig() {
  const apiKey = document.getElementById("inputApiKey").value.trim();
  const modelo = document.getElementById("selectModelo").value;
  const tokens = document.getElementById("inputMaxTokens").value;

  if (!apiKey) {
    mostrarToast("⚠️ Informe a chave da API antes de salvar.");
    return;
  }
  if (!apiKey.startsWith("sk-ant-")) {
    mostrarToast("⚠️ Chave inválida. Deve começar com sk-ant-");
    return;
  }

  localStorage.setItem("coruj_api_key", apiKey);
  localStorage.setItem("coruj_modelo",  modelo);
  localStorage.setItem("coruj_tokens",  tokens);
  fecharConfig();
  mostrarToast("✅ Configurações salvas com sucesso!");
}
