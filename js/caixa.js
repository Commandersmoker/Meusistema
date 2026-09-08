/* =========================================
   FLUXO DE CAIXA
========================================= */

let banco = obterBanco();


// =========================================
// INICIALIZAÇÃO
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    banco = obterBanco();

    atualizarResumoCaixa();

    listarMovimentacoes();

});


// =========================================
// RESUMO
// =========================================

function atualizarResumoCaixa() {

    banco = obterBanco();

    const caixa = banco.caixa || [];


    let entradas = 0;
    let saidas = 0;
    let vendas = 0;


    caixa.forEach(movimentacao => {

        const valor =
            Number(movimentacao.valor) || 0;


        if (movimentacao.tipo === "entrada") {

            entradas += valor;

        }


        if (movimentacao.tipo === "saida") {

            saidas += valor;

        }


        if (
            movimentacao.tipo === "entrada" &&
            movimentacao.categoria === "Venda"
        ) {

            vendas += valor;

        }

    });


    const saldo = entradas - saidas;


    document.getElementById(
        "saldoAtual"
    ).textContent = formatarMoeda(saldo);


    document.getElementById(
        "totalEntradas"
    ).textContent = formatarMoeda(entradas);


    document.getElementById(
        "totalSaidas"
    ).textContent = formatarMoeda(saidas);


    document.getElementById(
        "totalVendas"
    ).textContent = formatarMoeda(vendas);

}


// =========================================
// LISTAR MOVIMENTAÇÕES
// =========================================

function listarMovimentacoes() {

    banco = obterBanco();

    const tbody =
        document.getElementById("listaCaixa");


    if (!tbody) return;


    let movimentacoes =
        [...(banco.caixa || [])];


    // =====================================
    // FILTROS
    // =====================================

    const dataInicial =
        document.getElementById(
            "dataInicial"
        ).value;


    const dataFinal =
        document.getElementById(
            "dataFinal"
        ).value;


    const tipo =
        document.getElementById(
            "filtroTipo"
        ).value;


    const pagamento =
        document.getElementById(
            "filtroPagamento"
        ).value;


    movimentacoes = movimentacoes.filter(
        movimentacao => {

            const data =
                new Date(
                    movimentacao.data
                );


            const dataFormatada =
                data.toISOString()
                    .split("T")[0];


            if (
                dataInicial &&
                dataFormatada < dataInicial
            ) {

                return false;

            }


            if (
                dataFinal &&
                dataFormatada > dataFinal
            ) {

                return false;

            }


            if (
                tipo &&
                movimentacao.tipo !== tipo
            ) {

                return false;

            }


            if (
                pagamento &&
                movimentacao.formaPagamento !== pagamento
            ) {

                return false;

            }


            return true;

        }
    );


    // Mais recentes primeiro

    movimentacoes.sort(
        (a, b) =>
            new Date(b.data) -
            new Date(a.data)
    );


    if (movimentacoes.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="cash-empty"
                >
                    Nenhuma movimentação encontrada.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML = "";


    movimentacoes.forEach(
        movimentacao => {

            const tr =
                document.createElement("tr");


            const data =
                formatarDataHora(
                    movimentacao.data
                );


            const entrada =
                movimentacao.tipo === "entrada";


            const sinal =
                entrada ? "+" : "-";


            const classe =
                entrada
                    ? "cash-in"
                    : "cash-out";


            let acao = "";


            // Vendas não podem ser apagadas
            // manualmente

            if (movimentacao.vendaId) {

                acao = `
                    <span class="cash-sale">
                        Venda
                    </span>
                `;

            } else {

                acao = `

                    <button
                        class="btn-remove"
                        onclick="
                            excluirMovimentacao(
                                ${movimentacao.id}
                            )
                        "
                        title="Excluir"
                    >
                        ×
                    </button>

                `;

            }


            tr.innerHTML = `

                <td>
                    ${data}
                </td>

                <td>
                    <strong>
                        ${movimentacao.descricao || "-"}
                    </strong>
                </td>

                <td>
                    ${movimentacao.categoria || "-"}
                </td>

                <td>
                    ${movimentacao.formaPagamento || "-"}
                </td>

                <td>

                    <span class="${classe}">
                        ${entrada ? "Entrada" : "Saída"}
                    </span>

                </td>

                <td>

                    <strong class="${classe}">
                        ${sinal}
                        ${formatarMoeda(
                            movimentacao.valor
                        )}
                    </strong>

                </td>

                <td>
                    ${acao}
                </td>

            `;


            tbody.appendChild(tr);

        }
    );

}


// =========================================
// ABRIR MODAL
// =========================================

function abrirModalMovimentacao(tipo) {

    const modal =
        document.getElementById(
            "modalMovimentacao"
        );


    const titulo =
        document.getElementById(
            "tituloModalMovimentacao"
        );


    const tipoInput =
        document.getElementById(
            "tipoMovimentacao"
        );


    tipoInput.value = tipo;


    if (tipo === "entrada") {

        titulo.textContent =
            "Nova entrada";

    } else {

        titulo.textContent =
            "Nova saída";

    }


    document.getElementById(
        "descricaoMovimentacao"
    ).value = "";


    document.getElementById(
        "valorMovimentacao"
    ).value = "";


    document.getElementById(
        "categoriaMovimentacao"
    ).value =
        tipo === "entrada"
            ? "Outros"
            : "Despesas";


    modal.classList.add("show");

}


// =========================================
// FECHAR MODAL
// =========================================

function fecharModalMovimentacao() {

    const modal =
        document.getElementById(
            "modalMovimentacao"
        );


    modal.classList.remove("show");

}


// =========================================
// SALVAR MOVIMENTAÇÃO
// =========================================

function salvarMovimentacao(event) {

    event.preventDefault();


    banco = obterBanco();


    const tipo =
        document.getElementById(
            "tipoMovimentacao"
        ).value;


    const descricao =
        document.getElementById(
            "descricaoMovimentacao"
        ).value.trim();


    const valor =
        Number(
            document.getElementById(
                "valorMovimentacao"
            ).value
        );


    const categoria =
        document.getElementById(
            "categoriaMovimentacao"
        ).value;


    const formaPagamento =
        document.getElementById(
            "pagamentoMovimentacao"
        ).value;


    if (!descricao) {

        alert(
            "Informe uma descrição."
        );

        return;

    }


    if (!valor || valor <= 0) {

        alert(
            "Informe um valor válido."
        );

        return;

    }


    if (!banco.caixa) {

        banco.caixa = [];

    }


    banco.caixa.push({

        id: Date.now(),

        tipo: tipo,

        categoria: categoria,

        descricao: descricao,

        valor: valor,

        formaPagamento: formaPagamento,

        vendaId: null,

        data: new Date().toISOString()

    });


    salvarBanco(banco);


    fecharModalMovimentacao();


    atualizarResumoCaixa();

    listarMovimentacoes();


    alert(
        tipo === "entrada"
            ? "Entrada registrada com sucesso!"
            : "Saída registrada com sucesso!"
    );

}


// =========================================
// EXCLUIR MOVIMENTAÇÃO
// =========================================

function excluirMovimentacao(id) {

    banco = obterBanco();


    const movimentacao =
        banco.caixa.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!movimentacao) return;


    // Proteção contra exclusão de venda

    if (movimentacao.vendaId) {

        alert(
            "Movimentações geradas por vendas não podem ser excluídas por aqui."
        );

        return;

    }


    const confirmar = confirm(

        `Excluir esta movimentação?\n\n` +

        `${movimentacao.descricao}\n` +

        `${formatarMoeda(
            movimentacao.valor
        )}`

    );


    if (!confirmar) return;


    banco.caixa =
        banco.caixa.filter(
            item =>
                Number(item.id) !== Number(id)
        );


    salvarBanco(banco);


    atualizarResumoCaixa();

    listarMovimentacoes();

}


// =========================================
// DATA + HORA
// =========================================

function formatarDataHora(data) {

    if (!data) return "-";


    const dataObj =
        new Date(data);


    return dataObj.toLocaleDateString(
        "pt-BR"
    ) + " " +
    dataObj.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================
// FECHAR CLICANDO FORA
// =========================================

window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "modalMovimentacao"
            );


        if (
            event.target === modal
        ) {

            fecharModalMovimentacao();

        }

    }
);