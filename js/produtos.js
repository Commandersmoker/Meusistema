/*
==================================================
 ARTESANATO GESTÃO
 MÓDULO DE PRODUTOS
==================================================
*/


/*
==================================================
 VARIÁVEIS
==================================================
*/

let produtoEditando = null;


/*
==================================================
 ABRIR MODAL
==================================================
*/

function abrirModalProduto(id = null) {

    const modal =
        document.getElementById("modalProduto");

    const titulo =
        document.getElementById("tituloModal");

    const form =
        document.getElementById("formProduto");


    form.reset();

    document.getElementById("produtoId").value = "";

    document.getElementById("quantidade").value = 0;

    document.getElementById("estoqueMinimo").value = 0;

    document.getElementById("previewMargem").textContent = "0%";


    produtoEditando = null;


    if (id !== null) {

        const banco = obterBanco();

        const produto =
            banco.produtos.find(
                item => item.id === id
            );


        if (!produto) {

            alert("Produto não encontrado.");

            return;

        }


        titulo.textContent =
            "Editar produto";


        document.getElementById(
            "produtoId"
        ).value = produto.id;


        document.getElementById(
            "codigo"
        ).value = produto.codigo;


        document.getElementById(
            "nome"
        ).value = produto.nome;


        document.getElementById(
            "categoria"
        ).value = produto.categoria || "";


        document.getElementById(
            "quantidade"
        ).value = produto.quantidade;


        document.getElementById(
            "estoqueMinimo"
        ).value = produto.estoqueMinimo;


        document.getElementById(
            "custo"
        ).value = produto.custo;


        document.getElementById(
            "preco"
        ).value = produto.preco;


        produtoEditando = produto;

        atualizarMargem();

    } else {

        titulo.textContent =
            "Novo produto";

    }


    modal.classList.add("active");

}


/*
==================================================
 FECHAR MODAL
==================================================
*/

function fecharModalProduto() {

    document
        .getElementById("modalProduto")
        .classList.remove("active");

}


/*
==================================================
 SALVAR PRODUTO
==================================================
*/

function salvarProduto(event) {

    event.preventDefault();


    const banco =
        obterBanco();


    const id =
        document.getElementById(
            "produtoId"
        ).value;


    const codigo =
        document.getElementById(
            "codigo"
        ).value.trim();


    const nome =
        document.getElementById(
            "nome"
        ).value.trim();


    const categoria =
        document.getElementById(
            "categoria"
        ).value.trim();


    const quantidade =
        Number(
            document.getElementById(
                "quantidade"
            ).value
        );


    const estoqueMinimo =
        Number(
            document.getElementById(
                "estoqueMinimo"
            ).value
        );


    const custo =
        Number(
            document.getElementById(
                "custo"
            ).value
        );


    const preco =
        Number(
            document.getElementById(
                "preco"
            ).value
        );


    /*
    ==============================
    VALIDAÇÕES
    ==============================
    */

    if (!codigo || !nome) {

        alert(
            "Preencha o código e o nome."
        );

        return;

    }


    if (custo < 0 || preco < 0) {

        alert(
            "Os valores não podem ser negativos."
        );

        return;

    }


    /*
    ==============================
    VERIFICAR CÓDIGO DUPLICADO
    ==============================
    */

    const codigoExistente =
        banco.produtos.find(produto => {

            return (
                produto.codigo.toLowerCase() ===
                codigo.toLowerCase() &&
                String(produto.id) !== String(id)
            );

        });


    if (codigoExistente) {

        alert(
            "Já existe um produto com esse código."
        );

        return;

    }


    /*
    ==============================
    NOVO PRODUTO
    ==============================
    */

    if (!id) {

        const novoProduto = {

            id: Date.now(),

            codigo,

            nome,

            categoria,

            quantidade,

            estoqueMinimo,

            custo,

            preco,

            criadoEm:
                new Date().toISOString()

        };


        banco.produtos.push(
            novoProduto
        );


        /*
        REGISTRA ENTRADA INICIAL
        */

        if (quantidade > 0) {

            banco.estoqueMovimentacoes.push({

                id: Date.now() + 1,

                produtoId:
                    novoProduto.id,

                produto:
                    novoProduto.nome,

                tipo:
                    "entrada",

                quantidade,

                motivo:
                    "Estoque inicial",

                data:
                    new Date().toISOString()

            });

        }


    } else {

        /*
        ==============================
        EDITAR PRODUTO
        ==============================
        */

        const indice =
            banco.produtos.findIndex(
                produto =>
                    String(produto.id) ===
                    String(id)
            );


        if (indice === -1) {

            alert(
                "Produto não encontrado."
            );

            return;

        }


        banco.produtos[indice] = {

            ...banco.produtos[indice],

            codigo,

            nome,

            categoria,

            quantidade,

            estoqueMinimo,

            custo,

            preco,

            atualizadoEm:
                new Date().toISOString()

        };

    }


    /*
    ==============================
    SALVAR
    ==============================
    */

    salvarBanco(banco);


    fecharModalProduto();

    listarProdutos();

    atualizarResumoProdutos();

    listarHistorico();


    alert(
        "Produto salvo com sucesso!"
    );

}


/*
==================================================
 LISTAR PRODUTOS
==================================================
*/

function listarProdutos() {

    const banco =
        obterBanco();


    const tabela =
        document.getElementById(
            "listaProdutos"
        );


    const busca =
        (
            document.getElementById(
                "buscarProduto"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    let produtos =
        banco.produtos.filter(produto => {

            return (
                produto.nome
                    .toLowerCase()
                    .includes(busca) ||

                produto.codigo
                    .toLowerCase()
                    .includes(busca) ||

                (produto.categoria || "")
                    .toLowerCase()
                    .includes(busca)
            );

        });


    if (!produtos.length) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty"
                >
                    Nenhum produto encontrado.
                </td>

            </tr>

        `;

        return;

    }


    tabela.innerHTML =
        produtos.map(produto => {

            const margem =
                calcularMargem(
                    produto.custo,
                    produto.preco
                );


            let status;

            if (
                Number(produto.quantidade) <= 0
            ) {

                status = `
                    <span class="status empty">
                        Sem estoque
                    </span>
                `;

            } else if (
                Number(produto.quantidade)
                <=
                Number(produto.estoqueMinimo)
            ) {

                status = `
                    <span class="status low">
                        Estoque baixo
                    </span>
                `;

            } else {

                status = `
                    <span class="status ok">
                        Normal
                    </span>
                `;

            }


            return `

                <tr>

                    <td>
                        <strong>
                            ${produto.codigo}
                        </strong>
                    </td>

                    <td>
                        ${produto.nome}
                    </td>

                    <td>
                        ${produto.categoria || "-"}
                    </td>

                    <td>
                        <strong>
                            ${produto.quantidade}
                        </strong>
                    </td>

                    <td>
                        ${formatarMoeda(produto.custo)}
                    </td>

                    <td>
                        ${formatarMoeda(produto.preco)}
                    </td>

                    <td>
                        ${margem.toFixed(1)}%
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-button"
                                title="Editar"
                                onclick="abrirModalProduto(${produto.id})"
                            >
                                ✏️
                            </button>

                            <button
                                class="action-button"
                                title="Movimentar estoque"
                                onclick="abrirModalMovimentacao(${produto.id})"
                            >
                                ↕️
                            </button>

                            <button
                                class="action-button"
                                title="Excluir"
                                onclick="excluirProduto(${produto.id})"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/*
==================================================
 CALCULAR MARGEM
==================================================
*/

function calcularMargem(
    custo,
    preco
) {

    custo = Number(custo);

    preco = Number(preco);


    if (preco <= 0) {

        return 0;

    }


    return (
        (preco - custo) /
        preco
    ) * 100;

}


/*
==================================================
 ATUALIZAR MARGEM NO FORMULÁRIO
==================================================
*/

function atualizarMargem() {

    const custo =
        Number(
            document.getElementById(
                "custo"
            ).value
        );


    const preco =
        Number(
            document.getElementById(
                "preco"
            ).value
        );


    const margem =
        calcularMargem(
            custo,
            preco
        );


    document.getElementById(
        "previewMargem"
    ).textContent =
        `${margem.toFixed(1)}%`;

}


/*
==================================================
 MOVIMENTAÇÃO
==================================================
*/

function abrirModalMovimentacao(id) {

    const banco =
        obterBanco();


    const produto =
        banco.produtos.find(
            item => item.id === id
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    document.getElementById(
        "movimentacaoProdutoId"
    ).value =
        produto.id;


    document.getElementById(
        "produtoMovimentacaoNome"
    ).textContent =
        `${produto.nome} — Estoque atual: ${produto.quantidade}`;


    document.getElementById(
        "quantidadeMovimentacao"
    ).value = "";


    document.getElementById(
        "modalMovimentacao"
    ).classList.add("active");

}


/*
==================================================
 FECHAR MOVIMENTAÇÃO
==================================================
*/

function fecharModalMovimentacao() {

    document
        .getElementById(
            "modalMovimentacao"
        )
        .classList.remove("active");

}


/*
==================================================
 SALVAR MOVIMENTAÇÃO
==================================================
*/

function salvarMovimentacao(event) {

    event.preventDefault();


    const banco =
        obterBanco();


    const produtoId =
        Number(
            document.getElementById(
                "movimentacaoProdutoId"
            ).value
        );


    const tipo =
        document.getElementById(
            "tipoMovimentacao"
        ).value;


    const quantidade =
        Number(
            document.getElementById(
                "quantidadeMovimentacao"
            ).value
        );


    const motivo =
        document.getElementById(
            "motivoMovimentacao"
        ).value;


    const produto =
        banco.produtos.find(
            item =>
                item.id === produtoId
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    if (quantidade <= 0) {

        alert(
            "Informe uma quantidade válida."
        );

        return;

    }


    /*
    ==============================
    SAÍDA
    ==============================
    */

    if (tipo === "saida") {

        if (
            quantidade >
            Number(produto.quantidade)
        ) {

            alert(
                `Estoque insuficiente.\n\nDisponível: ${produto.quantidade}`
            );

            return;

        }


        produto.quantidade -= quantidade;

    }


    /*
    ==============================
    ENTRADA
    ==============================
    */

    if (tipo === "entrada") {

        produto.quantidade += quantidade;

    }


    /*
    ==============================
    HISTÓRICO
    ==============================
    */

    banco.estoqueMovimentacoes.push({

        id: Date.now(),

        produtoId:

            produto.id,

        produto:

            produto.nome,

        tipo,

        quantidade,

        motivo,

        data:

            new Date().toISOString()

    });


    salvarBanco(banco);


    fecharModalMovimentacao();

    listarProdutos();

    atualizarResumoProdutos();

    listarHistorico();


    alert(
        "Estoque atualizado com sucesso!"
    );

}


/*
==================================================
 EXCLUIR PRODUTO
==================================================
*/

function excluirProduto(id) {

    const banco =
        obterBanco();


    const produto =
        banco.produtos.find(
            item => item.id === id
        );


    if (!produto) {

        return;

    }


    const confirmar =
        confirm(
            `Deseja realmente excluir "${produto.nome}"?`
        );


    if (!confirmar) {

        return;

    }


    banco.produtos =
        banco.produtos.filter(
            item => item.id !== id
        );


    salvarBanco(banco);


    listarProdutos();

    atualizarResumoProdutos();

    listarHistorico();

}


/*
==================================================
 RESUMO
==================================================
*/

function atualizarResumoProdutos() {

    const banco =
        obterBanco();


    const produtos =
        banco.produtos;


    const quantidade =
        produtos.length;


    const valorCusto =
        produtos.reduce(
            (
                total,
                produto
            ) =>
                total +
                (
                    Number(produto.quantidade) *
                    Number(produto.custo)
                ),
            0
        );


    const valorVenda =
        produtos.reduce(
            (
                total,
                produto
            ) =>
                total +
                (
                    Number(produto.quantidade) *
                    Number(produto.preco)
                ),
            0
        );


    const estoqueBaixo =
        produtos.filter(
            produto =>
                Number(produto.quantidade)
                <=
                Number(produto.estoqueMinimo)
        ).length;


    document.getElementById(
        "totalProdutos"
    ).textContent =
        quantidade;


    document.getElementById(
        "valorEstoqueProdutos"
    ).textContent =
        formatarMoeda(valorCusto);


    document.getElementById(
        "valorVendaEstoque"
    ).textContent =
        formatarMoeda(valorVenda);


    document.getElementById(
        "totalEstoqueBaixo"
    ).textContent =
        estoqueBaixo;

}


/*
==================================================
 HISTÓRICO
==================================================
*/

function listarHistorico() {

    const banco =
        obterBanco();


    const tabela =
        document.getElementById(
            "historicoEstoque"
        );


    const movimentacoes =
        [...banco.estoqueMovimentacoes]
            .sort(
                (a, b) =>
                    new Date(b.data) -
                    new Date(a.data)
            )
            .slice(0, 10);


    if (!movimentacoes.length) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >
                    Nenhuma movimentação registrada.
                </td>

            </tr>

        `;

        return;

    }


    tabela.innerHTML =
        movimentacoes.map(
            movimento => {

                const entrada =
                    movimento.tipo === "entrada";


                return `

                    <tr>

                        <td>
                            ${formatarData(
                                movimento.data
                            )}
                        </td>

                        <td>
                            ${movimento.produto}
                        </td>

                        <td>

                            ${
                                entrada
                                    ? `
                                        <span class="status ok">
                                            Entrada
                                        </span>
                                      `
                                    : `
                                        <span class="status low">
                                            Saída
                                        </span>
                                      `
                            }

                        </td>

                        <td>
                            ${
                                entrada
                                    ? "+"
                                    : "-"
                            }${movimento.quantidade}
                        </td>

                        <td>
                            ${escapeHtml(movimento.motivo || "-")}
                        </td>

                        <td class="movement-actions-cell">
                            <button
                                type="button"
                                class="btn-delete-movement"
                                onclick="excluirMovimentacaoEstoque(${movimento.id})"
                                title="Excluir movimentação do histórico"
                                aria-label="Excluir movimentação"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 6h18"></path>
                                    <path d="M8 6V4h8v2"></path>
                                    <path d="M19 6l-1 14H6L5 6"></path>
                                    <path d="M10 11v5"></path>
                                    <path d="M14 11v5"></path>
                                </svg>
                                <span>Excluir</span>
                            </button>
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/*
==================================================
 EXCLUIR MOVIMENTAÇÃO DO HISTÓRICO
==================================================
*/

function excluirMovimentacaoEstoque(idMovimentacao) {

    const banco = obterBanco();

    const indice = banco.estoqueMovimentacoes.findIndex(
        movimento => String(movimento.id) === String(idMovimentacao)
    );

    if (indice === -1) {
        alert("Movimentação não encontrada.");
        return;
    }

    const movimento = banco.estoqueMovimentacoes[indice];

    const confirmar = confirm(
        `Excluir esta movimentação do histórico?\n\n` +
        `Produto: ${movimento.produto || "-"}\n` +
        `Tipo: ${movimento.tipo === "entrada" ? "Entrada" : "Saída"}\n` +
        `Quantidade: ${movimento.quantidade || 0}\n` +
        `Motivo: ${movimento.motivo || "-"}\n\n` +
        `Atenção: isso remove somente o registro do histórico e NÃO altera o estoque atual.`
    );

    if (!confirmar) return;

    banco.estoqueMovimentacoes.splice(indice, 1);
    salvarBanco(banco);

    listarHistorico();
}


/*
==================================================
 EVENTOS
==================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        listarProdutos();

        atualizarResumoProdutos();

        listarHistorico();


        /*
        Atualiza margem
        */

        document
            .getElementById("custo")
            .addEventListener(
                "input",
                atualizarMargem
            );


        document
            .getElementById("preco")
            .addEventListener(
                "input",
                atualizarMargem
            );


        /*
        Fechar modal clicando fora
        */

        document
            .getElementById("modalProduto")
            .addEventListener(
                "click",
                function(event) {

                    if (
                        event.target === this
                    ) {

                        fecharModalProduto();

                    }

                }
            );


        document
            .getElementById("modalMovimentacao")
            .addEventListener(
                "click",
                function(event) {

                    if (
                        event.target === this
                    ) {

                        fecharModalMovimentacao();

                    }

                }
            );

    }
);