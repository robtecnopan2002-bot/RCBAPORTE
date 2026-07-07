// --- VARIÁVEIS DE CONTROLE FINANCEIRO ---
let valorSelecionado = 0; 
let capitalBanca = 0;     
let lucroAcumulado = 0;   
let diasRendidos = 0;     
let cronometroRendimento = null;

let labelsGrafico = ["Início"];
let dadosAportes = [];
let dadosLucros = [];
let meuGrafico = null;

// Banco de Dados Simulado em Memória
let dbUsuarioLogado = { nome: "Demonstração", cpf: "000.000.000-00", cel: "(41) 99999-9999", end: "Curitiba, PR" };
let dbListaSaquesAdmin = [];

// --- SISTEMA CENTRAL DE TRANSIÇÃO DE TELAS ---
function navegarPara(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    
    const secaoAlvo = document.getElementById(idTela);
    if(secaoAlvo) { secaoAlvo.style.display = 'block'; }
    window.scrollTo(0,0);

    const btnTopoFluxo = document.getElementById('btn-topo-fluxo');
    const btnTopoLogin = document.getElementById('btn-topo-login');

    if(idTela === 'tela-admin') {
        renderizarDadosAdmin();
    }

    if(idTela === 'tela-painel' || idTela === 'tela-saque' || idTela === 'tela-admin') {
        btnTopoLogin.style.display = "none";
        btnTopoFluxo.innerText = "Desconectar";
        btnTopoFluxo.style.backgroundColor = "#64748b";
        btnTopoFluxo.onclick = function() { location.reload(); };
    } else {
        btnTopoLogin.style.display = "block";
        btnTopoFluxo.innerText = "Começar Agora";
        btnTopoFluxo.style.backgroundColor = "#111111";
        btnTopoFluxo.onclick = function() { navegarPara('tela-cadastro'); };
    }
}

// --- MÁSCARAS DE INPUT ---
function maskCPF(i) {
    let v = i.value.replace(/\D/g,"");
    if(v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if(v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    else if(v.length > 3) v = v.replace(/(\d{3})(\d{3})/, "$1.$2");
    i.value = v;
}
function maskCel(i) {
    let v = i.value.replace(/\D/g,"");
    if(v.length > 10) i.value = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    else if(v.length > 6) i.value = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    else if(v.length > 2) i.value = v.replace(/^(\d{2})(\d{0,4})$/, "($1) $2");
}

// --- VALIDAÇÕES DE LOGIN E CADASTRO ---
function validarLogin(e) {
    e.preventDefault();
    const usuario = document.getElementById('log-usuario').value.trim();
    const senha = document.getElementById('log-senha').value;

    if (usuario === 'admin' && senha === 'admin123') {
        navegarPara('tela-admin');
        return;
    }

    if (usuario.length < 4 || senha.length < 6) {
        alert("Credenciais incorretas!");
        return;
    }
    valorSelecionado = 1000;
    ativarBancaFinal(); 
}

function validarCadastro(e) {
    e.preventDefault();
    dbUsuarioLogado.nome = document.getElementById('cad-nome').value.trim();
    dbUsuarioLogado.cpf = document.getElementById('cad-cpf').value;
    dbUsuarioLogado.cel = document.getElementById('cad-celular').value;
    dbUsuarioLogado.end = document.getElementById('cad-end').value.trim();

    navegarPara('tela-aporte');
}

// --- GESTÃO DOS APORTES ---
function selecionarValorAporte(v, btn) {
    valorSelecionado = v;
    document.querySelectorAll('.btn-valor').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
function avancarParaPagamento() {
    if(valorSelecionado === 0) { alert("Escolha o plano de cotas desejado para avançar!"); return; }
    document.getElementById('pix-exibir-valor').innerText = valorSelecionado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    navegarPara('tela-pagamento');
}
function copiarPix() { alert("Código Copia e Cola enviado para a sua área de transferência!"); }

// --- CONFIGURAÇÃO DO GRÁFICO ---
function inicializarGrafico() {
    const ctx = document.getElementById('graficoBarrasRCB').getContext('2d');
    labelsGrafico = ["Início"];
    dadosAportes = [capitalBanca];
    dadosLucros = [0.00];

    if(meuGrafico) { meuGrafico.destroy(); } 

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labelsGrafico,
            datasets: [
                { label: 'Capital Alocado (R$)', data: dadosAportes, backgroundColor: '#111111' },
                { label: 'Lucro Disponível (R$)', data: dadosLucros, backgroundColor: '#10b981' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });
}

// --- CONTADOR DE ATIVAÇÃO DIÁRIA ---
function activarBancaFinal() {
    capitalBanca = valorSelecionado;
    inicializarGrafico();
    navegarPara('tela-painel');

    if(cronometroRendimento) clearInterval(cronometroRendimento);
    cronometroRendimento = setInterval(() => {
        diasRendidos++;
        const ganhoDiario = capitalBanca * 0.03;
        lucroAcumulado = ganhoDiario * diasRendidos;
        const totalGeral = capitalBanca + lucroAcumulado;

        document.getElementById('p-banca').innerText = capitalBanca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('p-lucro').innerText = lucroAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('p-total').innerText = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        labelsGrafico.push(`Dia ${diasRendidos}`);
        dadosAportes.push(parseFloat(capitalBanca.toFixed(2)));
        dadosLucros.push(parseFloat(lucroAcumulado.toFixed(2)));

        if(labelsGrafico.length > 10) { labelsGrafico.shift(); dadosAportes.shift(); dadosLucros.shift(); }
        meuGrafico.update();
    }, 1000);
}

// --- REALOCAR ---
function realoqueManual() {
    if(lucroAcumulado <= 0) { alert("Não existem rendimentos disponíveis neste ciclo."); return; }
    capitalBanca = capitalBanca + lucroAcumulado;
    lucroAcumulado = 0;
    diasRendidos = 0;

    labelsGrafico = ["Realoque"];
    dadosAportes = [capitalBanca];
    dadosLucros = [0.00];
    
    meuGrafico.data.labels = labelsGrafico;
    meuGrafico.data.datasets[0].data = dadosAportes;
    meuGrafico.data.datasets[1].data = dadosLucros;
    meuGrafico.update();

    document.getElementById('p-banca').innerText = capitalBanca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('p-lucro').innerText = lucroAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('p-total').innerText = capitalBanca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    alert("Rendimentos incorporados ao capital com sucesso!");
}

// --- GESTÃO DE SAQUES E ADMINISTRAÇÃO MASTER ---
function ajustarPlaceholderSaque() {
    const t = document.getElementById('saque-tipo').value;
    document.getElementById('saque-chave').placeholder = t === 'cpf' ? "000.000.000-00" : "(00) 00000-0000";
}

function processarSaqueFinal() {
    const valor = parseFloat(document.getElementById('saque-valor').value);
    const chave = document.getElementById('saque-chave').value.trim();

    if(isNaN(valor) || valor > lucroAcumulado || valor < 10 || chave.length < 5) {
        alert("Ordem recusada. Verifique os dados inseridos.");
        return;
    }

    const agora = new Date();
    dbListaSaquesAdmin.push({
        id: Date.now(),
        data: agora.toLocaleDateString() + ' ' + agora.toLocaleTimeString(),
        cliente: dbUsuarioLogado.nome,
        valor: valor,
        chave: chave
    });

    lucroAcumulado = lucroAcumulado - valor;
    diasRendidos = 0; 
    
    alert(`Sua solicitação de saque de R$ ${valor.toFixed(2)} foi encaminhada para auditoria.`);
    navegarPara('tela-painel');
}

function renderizarDadosAdmin() {
    const tabelaUsuarios = document.getElementById('admin-tabela-usuarios');
    tabelaUsuarios.innerHTML = `
        <tr>
            <td><strong>${dbUsuarioLogado.nome}</strong></td>
            <td>${dbUsuarioLogado.cpf}</td>
            <td>${dbUsuarioLogado.cel}</td>
            <td>${dbUsuarioLogado.end}</td>
            <td style="color:#10b981; font-weight:bold;">${capitalBanca > 0 ? formatarMoeda(capitalBanca) : "Aguardando Ativação"}</td>
        </tr>
    `;

    const tabelaSaques = document.getElementById('admin-tabela-saques');
    if(dbListaSaquesAdmin.length === 0) {
        tabelaSaques.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Nenhuma solicitação em aberto.</td></tr>`;
        return;
    }

    tabelaSaques.innerHTML = "";
    dbListaSaquesAdmin.forEach(saque => {
        tabelaSaques.innerHTML += `
            <tr>
                <td>${saque.data}</td>
                <td><strong>${saque.cliente}</strong></td>
                <td style="color:#ef4444; font-weight:bold;">${formatarMoeda(saque.valor)}</td>
                <td><code>${saque.chave}</code></td>
                <td>
                    <button class="btn-tabela btn-aprovar" onclick="decidirSaque(${saque.id}, 'aprovar')">Aprovar PIX</button>
                    <button class="btn-tabela btn-recusar" onclick="decidirSaque(${saque.id}, 'recusar')">Estornar</button>
                </td>
            </tr>
        `;
    });
}

function decidirSaque(idSaque, acao) {
    if(acao === 'aprovar') { alert("Ordem aprovada! Transferência PIX concluída."); }
    else { alert("Ordem recusada! O valor foi estornado."); }
    dbListaSaquesAdmin = dbListaSaquesAdmin.filter(s => s.id !== idSaque);
    renderizarDadosAdmin();
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Força inicialização segura da Home
navegarPara('tela-home');