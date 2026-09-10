/* =========================================================
   MARCELINO BORDADOS - RELATÓRIOS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    definirPeriodoInicial();

    const inicio = document.getElementById("relatorioDataInicial");
    const fim = document.getElementById("relatorioDataFinal");

    if (inicio) inicio.addEventListener("change", gerarRelatorio);
    if (fim) fim.addEventListener("change", gerarRelatorio);

    gerarRelatorio();
});

function definirPeriodoInicial() {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const inicio = document.getElementById("relatorioDataInicial");
    const fim = document.getElementById("relatorioDataFinal");

    if (inicio) inicio.value = formatarInputDate(primeiroDia);
    if (fim) fim.value = formatarInputDate(hoje);
}

function formatarInputDate(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function dataNoPeriodo(data, dataInicial, dataFinal) {
    if (!data) return false;

    const objeto = new Date(data);
    if (Number.isNaN(objeto.getTime())) return false;

    const dataISO = formatarInputDate(objeto);

    if (dataInicial && dataISO < dataInicial) return false;
    if (dataFinal && dataISO > dataFinal) return false;

    return true;
}

function gerarRelatorio() {
    const banco = obterBanco();

    const dataInicial = document.getElementById("relatorioDataInicial")?.value || "";
    const dataFinal = document.getElementById("relatorioDataFinal")?.value || "";

    const vendas = (Array.isArray(banco.vendas) ? banco.vendas : [])
        .filter(venda => venda && venda.status !== "cancelada")
        .filter(venda => dataNoPeriodo(venda.data, dataInicial, dataFinal));

    calcularResumo(vendas, banco, dataInicial, dataFinal);
    calcularFinanceiro(banco, vendas, dataInicial, dataFinal);
    listarProdutosMaisVendidos(vendas);
    listarClientesDestaque(vendas);
    listarVendas(vendas);
}

function calcularResumo(vendas, banco, dataInicial, dataFinal) {
    /*
     * Faturamento reconhecido por recebimento:
     * vendas em aberto não entram. Quando a venda é quitada, o total passa
     * a pertencer ao período da data de pagamento/quitação.
     */
    const vendasFaturadas = (Array.isArray(banco.vendas) ? banco.vendas : [])
        .filter(venda => venda && venda.status !== "cancelada")
        .filter(venda => {
            const financeiro = typeof obterFinanceiroVenda === "function"
                ? obterFinanceiroVenda(venda)
                : { statusPagamento: venda.statusPagamento || "paga" };

            if (financeiro.statusPagamento !== "paga") return false;

            return dataNoPeriodo(
                venda.dataPagamento || venda.data,
                dataInicial,
                dataFinal
            );
        });

    const faturamento = vendasFaturadas.reduce(
        (total, venda) => total + Number(venda.total || 0),
        0
    );

    const quantidadeProdutos = vendas.reduce((total, venda) => {
        if (!Array.isArray(venda.produtos)) return total;

        return total + venda.produtos.reduce(
            (soma, item) => item.personalizado ? soma : soma + Number(item.quantidade || item.qtd || 0),
            0
        );
    }, 0);

    const quantidadeVendas = vendas.length;
    const ticketMedio = quantidadeVendas > 0
        ? faturamento / quantidadeVendas
        : 0;

    definirTexto("relatorioFaturamento", formatarMoeda(faturamento));
    definirTexto("relatorioVendas", quantidadeVendas);
    definirTexto("relatorioTicket", formatarMoeda(ticketMedio));
    definirTexto("relatorioProdutos", quantidadeProdutos);
    definirTexto(
        "relatorioContagemVendas",
        `${quantidadeVendas} ${quantidadeVendas === 1 ? "venda" : "vendas"}`
    );
}

function calcularFinanceiro(banco, vendas, dataInicial, dataFinal) {
    let entradas = 0;
    let saidas = 0;

    /* Estrutura atual do caixa */
    if (Array.isArray(banco.caixa) && banco.caixa.length) {
        banco.caixa
            .filter(mov => dataNoPeriodo(mov.data, dataInicial, dataFinal))
            .forEach(mov => {
                const valor = Number(mov.valor || 0);

                if (mov.tipo === "entrada") entradas += valor;
                if (mov.tipo === "saida") saidas += valor;
            });
    } else {
        /* Compatibilidade com versões anteriores do banco */
        const entradasManuais = Array.isArray(banco.entradasCaixa)
            ? banco.entradasCaixa
            : [];

        const saidasManuais = Array.isArray(banco.saidasCaixa)
            ? banco.saidasCaixa
            : [];

        entradasManuais
            .filter(mov => dataNoPeriodo(mov.data, dataInicial, dataFinal))
            .forEach(mov => entradas += Number(mov.valor || 0));

        saidasManuais
            .filter(mov => dataNoPeriodo(mov.data, dataInicial, dataFinal))
            .forEach(mov => saidas += Number(mov.valor || 0));

        /* Se não houver movimentos de vendas no caixa antigo, soma as vendas. */
        const possuiVendaEmEntradas = entradasManuais.some(
            mov => mov.origem === "venda" || mov.categoria === "Venda" || mov.vendaId
        );

        if (!possuiVendaEmEntradas) {
            entradas += vendas.reduce(
                (total, venda) => total + Number(venda.total || 0),
                0
            );
        }
    }

    const saldo = entradas - saidas;

    definirTexto("relatorioEntradas", formatarMoeda(entradas));
    definirTexto("relatorioSaidas", formatarMoeda(saidas));
    definirTexto("relatorioSaldo", formatarMoeda(saldo));
}

function listarProdutosMaisVendidos(vendas) {
    const container = document.getElementById("produtosMaisVendidos");
    if (!container) return;

    const produtos = new Map();

    vendas.forEach(venda => {
        if (!Array.isArray(venda.produtos)) return;

        venda.produtos.forEach(item => {
            if (item.personalizado) return;
            const nome = String(item.nome || item.produto || "Produto").trim();
            const quantidade = Number(item.quantidade || item.qtd || 0);
            const preco = Number(item.preco || item.valor || 0);
            const totalItem = Number(item.total || (preco * quantidade));

            if (!produtos.has(nome)) {
                produtos.set(nome, { nome, quantidade: 0, total: 0 });
            }

            const produto = produtos.get(nome);
            produto.quantidade += quantidade;
            produto.total += totalItem;
        });
    });

    const ranking = [...produtos.values()]
        .sort((a, b) => {
            if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
            return b.total - a.total;
        })
        .slice(0, 5);

    if (!ranking.length) {
        container.innerHTML = criarEstadoVazioRanking(
            "Nenhuma venda encontrada",
            "Os produtos mais vendidos aparecerão aqui."
        );
        return;
    }

    container.innerHTML = ranking.map((produto, index) => `
        <div class="ranking-item">
            <div class="ranking-position">${index + 1}</div>

            <div class="ranking-info">
                <strong title="${escapeHtml(produto.nome)}">${escapeHtml(produto.nome)}</strong>
                <span>
                    ${produto.quantidade}
                    ${produto.quantidade === 1 ? "unidade vendida" : "unidades vendidas"}
                </span>
            </div>

            <div class="ranking-value">
                <strong>${formatarMoeda(produto.total)}</strong>
                <span>em vendas</span>
            </div>
        </div>
    `).join("");
}

function listarClientesDestaque(vendas) {
    const container = document.getElementById("clientesDestaque");
    if (!container) return;

    const clientes = new Map();

    vendas.forEach(venda => {
        const nome = String(
            venda.cliente || "Consumidor não identificado"
        ).trim();

        const chave = venda.clienteId
            ? `id:${venda.clienteId}`
            : `nome:${nome.toLowerCase()}`;

        if (!clientes.has(chave)) {
            clientes.set(chave, {
                nome,
                compras: 0,
                total: 0
            });
        }

        const cliente = clientes.get(chave);
        cliente.compras += 1;
        cliente.total += Number(venda.total || 0);
    });

    const ranking = [...clientes.values()]
        .sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return b.compras - a.compras;
        })
        .slice(0, 5);

    if (!ranking.length) {
        container.innerHTML = criarEstadoVazioRanking(
            "Nenhuma compra encontrada",
            "Os clientes em destaque aparecerão aqui."
        );
        return;
    }

    container.innerHTML = ranking.map((cliente, index) => `
        <div class="ranking-item">
            <div class="ranking-position">${index + 1}</div>

            <div class="ranking-info">
                <strong title="${escapeHtml(cliente.nome)}">${escapeHtml(cliente.nome)}</strong>
                <span>
                    ${cliente.compras}
                    ${cliente.compras === 1 ? "compra realizada" : "compras realizadas"}
                </span>
            </div>

            <div class="ranking-value">
                <strong>${formatarMoeda(cliente.total)}</strong>
                <span>total comprado</span>
            </div>
        </div>
    `).join("");
}

function listarVendas(vendas) {
    const tbody = document.getElementById("relatorioListaVendas");
    if (!tbody) return;

    if (!vendas.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="report-table-empty">
                    <div class="report-table-empty-state">
                        <strong>Nenhuma venda encontrada</strong>
                        <span>Altere o período do relatório para consultar outras vendas.</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const ordenadas = [...vendas].sort(
        (a, b) => new Date(b.data) - new Date(a.data)
    );

    tbody.innerHTML = ordenadas.map(venda => {
        const quantidadeProdutos = Array.isArray(venda.produtos)
            ? venda.produtos.reduce(
                (total, item) => item.personalizado ? total : total + Number(item.quantidade || item.qtd || 0),
                0
            )
            : 0;

        return `
            <tr>
                <td><strong>#${escapeHtml(venda.comanda || venda.id || "-")}</strong></td>
                <td>${escapeHtml(venda.cliente || "Consumidor não identificado")}</td>
                <td>${formatarData(venda.data)}</td>
                <td><span class="report-payment-badge">${escapeHtml(typeof formatarPagamentoVenda === "function" ? formatarPagamentoVenda(venda) : (venda.pagamento || "-"))}</span></td>
                <td>${quantidadeProdutos}</td>
                <td class="report-total">${formatarMoeda(Number(venda.total || 0))}</td>
            </tr>
        `;
    }).join("");
}

function criarEstadoVazioRanking(titulo, descricao) {
    return `
        <div class="ranking-empty">
            <div class="ranking-empty-icon">—</div>
            <strong>${escapeHtml(titulo)}</strong>
            <span>${escapeHtml(descricao)}</span>
        </div>
    `;
}

function definirTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

/* Usa escapeHtml do database.js quando disponível. */
if (typeof window.escapeHtml !== "function" && typeof escapeHtml !== "function") {
    window.escapeHtml = function (valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };
}
