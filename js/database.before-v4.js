/* ==================================================
   MARCELINO BORDADOS — BANCO LOCAL
   Compatível com todas as páginas do sistema.
   ================================================== */

const DB_NAME = "artesanatoGestao";

const databaseDefault = {
    produtos: [],
    clientes: [],
    vendas: [],
    caixa: [],
    usuarios: [],
    estoqueMovimentacoes: [],
    entradasCaixa: [],
    saidasCaixa: [],
    configuracoes: {
        empresa: {
            nome: "Marcelino Bordados",
            telefone: "",
            email: "",
            endereco: "",
            documento: ""
        },
        usuario: "Administrador",
        corPrincipal: "#2563eb"
    }
};

function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function normalizarVendaFinanceira(venda) {
    const copia = { ...(venda || {}) };
    const total = Number(copia.total || 0);

    if (copia.status === "cancelada") {
        copia.statusPagamento = copia.statusPagamento || "cancelada";
        copia.valorPago = Number(copia.valorPago || 0);
        copia.valorPendente = 0;
        copia.pagamentos = Array.isArray(copia.pagamentos) ? copia.pagamentos : [];
        return copia;
    }

    if (!copia.statusPagamento) {
        // Vendas antigas são consideradas pagas para preservar o histórico existente.
        copia.statusPagamento = "paga";
    }

    copia.pagamentos = Array.isArray(copia.pagamentos) ? copia.pagamentos : [];

    if (copia.statusPagamento === "paga") {
        copia.valorPago = Number.isFinite(Number(copia.valorPago)) ? Number(copia.valorPago) : total;
        if (copia.valorPago <= 0 && total > 0) copia.valorPago = total;
        copia.valorPendente = 0;
        copia.dataPagamento = copia.dataPagamento || copia.data || null;
    } else {
        copia.valorPago = Math.max(0, Number(copia.valorPago || 0));
        copia.valorPendente = Math.max(0, total - copia.valorPago);
        if (copia.valorPendente <= 0.009) {
            copia.valorPendente = 0;
            copia.statusPagamento = "paga";
            copia.dataPagamento = copia.dataPagamento || copia.data || null;
        } else {
            copia.statusPagamento = "aguardando";
        }
    }

    return copia;
}

function obterFinanceiroVenda(venda) {
    const normalizada = normalizarVendaFinanceira(venda);
    return {
        statusPagamento: normalizada.statusPagamento,
        valorPago: Number(normalizada.valorPago || 0),
        valorPendente: Number(normalizada.valorPendente || 0)
    };
}

function garantirEstrutura(banco) {
    const base = clonar(databaseDefault);
    const dados = banco && typeof banco === "object" ? banco : {};

    base.produtos = Array.isArray(dados.produtos)
        ? dados.produtos
        : [];

    base.clientes = Array.isArray(dados.clientes)
        ? dados.clientes
        : [];

    base.vendas = Array.isArray(dados.vendas)
        ? dados.vendas.map(venda => normalizarVendaFinanceira(venda))
        : [];

    base.caixa = Array.isArray(dados.caixa)
        ? dados.caixa
        : [];

    base.estoqueMovimentacoes = Array.isArray(dados.estoqueMovimentacoes)
        ? dados.estoqueMovimentacoes
        : [];

    base.entradasCaixa = Array.isArray(dados.entradasCaixa)
        ? dados.entradasCaixa
        : [];

    base.saidasCaixa = Array.isArray(dados.saidasCaixa)
        ? dados.saidasCaixa
        : [];
    
        base.usuarios = Array.isArray(dados.usuarios)
        ? dados.usuarios
    : [];

    if (
        dados.configuracoes &&
        typeof dados.configuracoes === "object"
    ) {
        base.configuracoes = {
            ...base.configuracoes,
            ...dados.configuracoes,

            empresa: {
                ...base.configuracoes.empresa,
                ...(dados.configuracoes.empresa || {})
            }
        };
    }

    return base;
}

function iniciarBanco() {

    const existente = localStorage.getItem(DB_NAME);

    if (!existente) {

        salvarBanco(clonar(databaseDefault));

        return;
    }

    try {

        const banco = JSON.parse(existente);

        const normalizado = garantirEstrutura(banco);

        // Tema antigo roxo -> nova identidade azul/amarela
        if (normalizado.configuracoes.corPrincipal === "#7c3aed") {
            normalizado.configuracoes.corPrincipal = "#2563eb";
        }

        localStorage.setItem(
            DB_NAME,
            JSON.stringify(normalizado)
        );

    } catch (erro) {

        console.error(
            "Banco local inválido. Recriando estrutura.",
            erro
        );

        salvarBanco(clonar(databaseDefault));
    }
}

function obterBanco() {

    iniciarBanco();

    try {

        return garantirEstrutura(
            JSON.parse(
                localStorage.getItem(DB_NAME)
            )
        );

    } catch (erro) {

        const banco = clonar(databaseDefault);

        salvarBanco(banco);

        return banco;
    }
}

function salvarBanco(banco) {

    localStorage.setItem(
        DB_NAME,
        JSON.stringify(
            garantirEstrutura(banco)
        )
    );
}

function atualizarBanco(categoria, dados) {

    const banco = obterBanco();

    banco[categoria] = dados;

    salvarBanco(banco);

    return banco;
}

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

function formatarData(data) {

    if (!data) return "-";

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return "-";
    }

    return dataObj.toLocaleDateString("pt-BR");
}

function vendaValida(venda) {

    return venda &&
        venda.status !== "cancelada";
}

function vendasValidas(vendas) {

    return (
        Array.isArray(vendas)
            ? vendas
            : []
    ).filter(vendaValida);
}

function gerarNumeroComanda() {

    const banco = obterBanco();

    const numeros = banco.vendas
        .map(venda =>
            parseInt(
                String(
                    venda.comanda || ""
                ).replace(/\D/g, ""),
                10
            )
        )
        .filter(Number.isFinite);

    const proximo =
        (numeros.length
            ? Math.max(...numeros)
            : 0
        ) + 1;

    return String(proximo).padStart(
        6,
        "0"
    );
}

function obterConfiguracoes() {

    return obterBanco().configuracoes;
}

function atualizarDashboard() {

    const ids = [

        "vendasHoje",

        "quantidadeVendasHoje",

        "faturamentoMes",

        "valorEstoque",

        "produtosEstoque",

        "totalClientes",

        "vendasRecentes",

        "estoqueBaixo",

        "entradasMes",

        "saidasMes",

        "saldoMes"

    ];

    /*
    O database.js é compartilhado
    por todas as páginas.

    Só executa o Dashboard quando
    seus elementos existem.
    */

    if (
        !ids.some(
            id => document.getElementById(id)
        )
    ) {
        return;
    }

    const banco = obterBanco();

    const vendas = vendasValidas(
        banco.vendas
    );

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = hoje.getMonth();

    const vendasHoje = vendas.filter(
        venda => {

            const data =
                new Date(venda.data);

            return (
                !Number.isNaN(
                    data.getTime()
                ) &&

                data.getDate() ===
                    hoje.getDate() &&

                data.getMonth() ===
                    mes &&

                data.getFullYear() ===
                    ano
            );
        }
    );

    const vendasMes = vendas.filter(
        venda => {

            const data =
                new Date(venda.data);

            return (
                !Number.isNaN(
                    data.getTime()
                ) &&

                data.getMonth() ===
                    mes &&

                data.getFullYear() ===
                    ano
            );
        }
    );

    const valorHoje =
        vendasHoje.reduce(
            (total, venda) =>
                total +
                Number(
                    venda.total || 0
                ),
            0
        );

    const faturamento =
        vendasMes.reduce(
            (total, venda) =>
                total +
                Number(
                    venda.total || 0
                ),
            0
        );

    const valorEstoque =
        banco.produtos.reduce(
            (
                total,
                produto
            ) =>
                total +
                Number(
                    produto.quantidade || 0
                ) *
                Number(
                    produto.custo || 0
                ),
            0
        );

    const quantidadeProdutos =
        banco.produtos.reduce(
            (
                total,
                produto
            ) =>
                total +
                Number(
                    produto.quantidade || 0
                ),
            0
        );

    definirTexto(
        "vendasHoje",
        formatarMoeda(valorHoje)
    );

    definirTexto(
        "quantidadeVendasHoje",

        `${vendasHoje.length} ${
            vendasHoje.length === 1
                ? "venda"
                : "vendas"
        }`
    );

    definirTexto(
        "faturamentoMes",
        formatarMoeda(faturamento)
    );

    definirTexto(
        "valorEstoque",
        formatarMoeda(valorEstoque)
    );

    definirTexto(
        "produtosEstoque",

        `${quantidadeProdutos} ${
            quantidadeProdutos === 1
                ? "unidade"
                : "unidades"
        }`
    );

    definirTexto(
        "totalClientes",
        banco.clientes.length
    );

    carregarVendasRecentes(
        vendas
    );

    carregarEstoqueBaixo(
        banco.produtos
    );

    atualizarCaixaDashboard(
        banco,
        mes,
        ano
    );
}

function definirTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function carregarVendasRecentes(vendas) {
    const tabela = document.getElementById("vendasRecentes");
    if (!tabela) return;

    const ordenadas = [...vendas]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);

    if (!ordenadas.length) {
        tabela.innerHTML = `<tr><td colspan="6" class="empty">Nenhuma venda registrada.</td></tr>`;
        return;
    }

    tabela.innerHTML = ordenadas.map(venda => `
        <tr>
            <td>#${escapeHtml(venda.comanda || "------")}</td>
            <td>${escapeHtml(venda.cliente || "Consumidor não identificado")}</td>
            <td>${formatarData(venda.data)}</td>
            <td>${escapeHtml(venda.pagamento || "-")}</td>
            <td><strong>${formatarMoeda(venda.total)}</strong></td>
            <td>
                <button type="button" class="dashboard-sale-view" onclick="abrirDetalhesVenda(${Number(venda.id)})" title="Ver detalhes da venda">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Ver</span>
                </button>
            </td>
        </tr>
    `).join("");
}

function abrirDetalhesVenda(idVenda) {
    const banco = obterBanco();
    const venda = banco.vendas.find(item => String(item.id) === String(idVenda));

    if (!venda) {
        alert("Venda não encontrada.");
        return;
    }

    const produtos = Array.isArray(venda.produtos) ? venda.produtos : [];

    definirTexto("detalheComanda", `Comanda #${venda.comanda || "------"}`);
    definirTexto("detalheCliente", venda.cliente || "Consumidor não identificado");
    definirTexto("detalheData", formatarData(venda.data));
    definirTexto("detalhePagamento", venda.pagamento || "-");
    definirTexto("detalheTotalTopo", formatarMoeda(venda.total));
    definirTexto("detalheSubtotal", formatarMoeda(venda.subtotal));
    definirTexto("detalheDesconto", formatarMoeda(venda.desconto));
    definirTexto("detalheTotal", formatarMoeda(venda.total));

    const quantidadeItens = produtos.reduce((total, produto) => total + Number(produto.quantidade || produto.qtd || 1), 0);
    definirTexto("detalheQuantidadeItens", `${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"}`);

    const tbody = document.getElementById("detalheProdutos");
    if (tbody) {
        if (!produtos.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="sale-detail-empty">Nenhum item encontrado nesta venda.</td></tr>`;
        } else {
            tbody.innerHTML = produtos.map(produto => {
                const quantidade = Number(produto.quantidade || produto.qtd || 1);
                const preco = Number(produto.preco || produto.valor || produto.precoVenda || 0);
                const totalItem = Number(produto.total || (preco * quantidade));
                return `
                    <tr>
                        <td><strong>${escapeHtml(produto.nome || produto.produto || "Produto")}</strong></td>
                        <td>${quantidade}</td>
                        <td>${formatarMoeda(preco)}</td>
                        <td><strong>${formatarMoeda(totalItem)}</strong></td>
                    </tr>
                `;
            }).join("");
        }
    }

    const modal = document.getElementById("modalVenda");
    if (modal) {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }
}

function fecharDetalhesVenda() {
    const modal = document.getElementById("modalVenda");
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("modal-open");
}

if (!window.__detalheVendaEscapeRegistrado) {
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") fecharDetalhesVenda();
    });
    window.__detalheVendaEscapeRegistrado = true;
}

function carregarEstoqueBaixo(
    produtos
) {

    const container =
        document.getElementById(
            "estoqueBaixo"
        );

    if (!container) return;

    const baixos =
        produtos.filter(
            produto =>
                Number(
                    produto.quantidade || 0
                ) <=
                Number(
                    produto.estoqueMinimo || 0
                )
        );

    if (!baixos.length) {

        container.innerHTML = `

            <div class="empty-stock">

                <div>📦</div>

                <p>
                    Nenhum produto com
                    estoque baixo.
                </p>

            </div>

        `;

        return;
    }

    container.innerHTML =
        baixos
            .map(
                produto => `

                    <div class="stock-item">

                        <div>

                            <strong>
                                ${escapeHtml(
                                    produto.nome ||
                                    "Produto"
                                )}
                            </strong>

                            <small>
                                Estoque:
                                ${Number(
                                    produto.quantidade ||
                                    0
                                )}
                            </small>

                        </div>

                        <span>
                            Repor
                        </span>

                    </div>

                `
            )
            .join("");
}

function atualizarCaixaDashboard(
    banco,
    mesAtual,
    anoAtual
) {

    const entradas =
        banco.entradasCaixa.filter(
            movimento =>
                dentroDoMes(
                    movimento.data,
                    mesAtual,
                    anoAtual
                )
        );

    const saidas =
        banco.saidasCaixa.filter(
            movimento =>
                dentroDoMes(
                    movimento.data,
                    mesAtual,
                    anoAtual
                )
        );

    const totalEntradas =
        entradas.reduce(
            (
                total,
                movimento
            ) =>
                total +
                Number(
                    movimento.valor || 0
                ),
            0
        );

    const totalSaidas =
        saidas.reduce(
            (
                total,
                movimento
            ) =>
                total +
                Number(
                    movimento.valor || 0
                ),
            0
        );

    definirTexto(
        "entradasMes",
        formatarMoeda(
            totalEntradas
        )
    );

    definirTexto(
        "saidasMes",
        formatarMoeda(
            totalSaidas
        )
    );

    definirTexto(
        "saldoMes",
        formatarMoeda(
            totalEntradas -
            totalSaidas
        )
    );
}

function dentroDoMes(
    data,
    mes,
    ano
) {

    const dataObj =
        new Date(data);

    return (
        !Number.isNaN(
            dataObj.getTime()
        ) &&

        dataObj.getMonth() ===
            mes &&

        dataObj.getFullYear() ===
            ano
    );
}

function escapeHtml(valor) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function exportarBackup() {

    const dados =
        JSON.stringify(
            obterBanco(),
            null,
            4
        );

    const blob =
        new Blob(
            [dados],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        `backup-artesanato-${
            new Date()
                .toISOString()
                .slice(0, 10)
        }.json`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );
}

function importarBackup(
    arquivo
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!arquivo) {

                return reject(
                    new Error(
                        "Nenhum arquivo selecionado."
                    )
                );
            }

            const leitor =
                new FileReader();

            leitor.onload =
                evento => {

                    try {

                        const dados =
                            JSON.parse(
                                evento.target
                                    .result
                            );

                        const banco =
                            garantirEstrutura(
                                dados
                            );

                        salvarBanco(
                            banco
                        );

                        resolve(
                            banco
                        );

                    } catch (erro) {

                        reject(
                            new Error(
                                "Arquivo de backup inválido."
                            )
                        );
                    }
                };

            leitor.onerror =
                () => {

                    reject(
                        new Error(
                            "Não foi possível ler o arquivo."
                        )
                    );
                };

            leitor.readAsText(
                arquivo
            );
        }
    );
}

/*
==================================================
COMPATIBILIDADE
==================================================

Código antigo que utilize:

getDatabase()

continuará funcionando.
*/

function getDatabase() {

    return obterBanco();
}

/*
==================================================
INICIALIZAÇÃO
==================================================
*/

iniciarBanco();

document.addEventListener(
    "DOMContentLoaded",
    atualizarDashboard
);