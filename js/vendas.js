/* =========================================
   VENDAS / COMANDAS
========================================= */

let banco = obterBanco();

let itensVenda = [];


// =========================================
// INICIALIZAÇÃO
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    banco = obterBanco();

    carregarClientes();

    gerarNumeroComanda();

    atualizarVenda();

    configurarBuscaProduto();

    configurarHistoricoVendas();

    configurarParcelamentoCartao();

    importarPedidoPelaURL();

    abrirRecebimentoPelaURL();

});



function importarPedidoPelaURL() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const pedidoId = parametros.get("pedido");
        if (!pedidoId) return;

        banco = obterBanco();
        const pedido = (banco.pedidos || []).find(p => String(p.id) === String(pedidoId));
        if (!pedido) { AppPopup.alert("Pedido não encontrado para importação."); return; }
        if (pedido.status === "cancelado") { AppPopup.alert("Este pedido está cancelado e não pode ser importado."); return; }
        if (pedido.vendaId) { AppPopup.alert("Este pedido já possui uma venda vinculada."); mostrarTelaVendas("historico"); return; }

        itensVenda = [];
        const itensPedido = Array.isArray(pedido.itens) ? pedido.itens : [];
        itensPedido.forEach(item => {
            itensVenda.push({
                produtoId: item.produtoId ?? null,
                nome: item.nome || "Produto",
                preco: Number(item.preco || 0),
                quantidade: Number(item.quantidade || 0),
                pedidoOrigemId: pedido.id,
                estoqueJaBaixado: true,
                tipo: "produto_pedido"
            });
        });

        const valorAdicional = Number(
            pedido.valorAdicional ??
            (!itensPedido.length ? pedido.valor : 0) ?? 0
        );
        if (valorAdicional > 0) {
            itensVenda.push({
                produtoId: null,
                chavePersonalizada: `pedido-${pedido.id}-adicional`,
                personalizado: true,
                tipo: "valor_pedido",
                nome: pedido.titulo ? `Pedido #${String(pedido.numero || 0).padStart(4,"0")} — ${pedido.titulo}` : `Pedido #${String(pedido.numero || 0).padStart(4,"0")}`,
                preco: valorAdicional,
                quantidade: 1,
                pedidoOrigemId: pedido.id,
                estoqueJaBaixado: true
            });
        }

        const clienteSelect = document.getElementById("clienteVenda");
        if (clienteSelect && pedido.clienteId && [...clienteSelect.options].some(o => String(o.value) === String(pedido.clienteId))) {
            clienteSelect.value = String(pedido.clienteId);
        }

        window.pedidoImportadoVendaId = pedido.id;
        atualizarVenda();
        mostrarAvisoPedidoImportado(pedido);
    } catch (erro) {
        console.error("Erro ao importar pedido para venda:", erro);
    }
}

function mostrarAvisoPedidoImportado(pedido) {
    const section = document.getElementById("novaVendaSection");
    if (!section || document.getElementById("pedidoImportadoAviso")) return;
    const aviso = document.createElement("div");
    aviso.id = "pedidoImportadoAviso";
    aviso.className = "sale-order-import-banner";
    aviso.innerHTML = `<div><strong>Pedido #${String(pedido.numero || 0).padStart(4,"0")} importado</strong><span>${pedido.cliente || "Consumidor não identificado"} • O estoque destes itens já foi baixado no pedido e não será descontado novamente.</span></div><a href="pedidos.html">Ver pedidos</a>`;
    section.parentNode.insertBefore(aviso, section);
}

function abrirRecebimentoPelaURL() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const vendaId = parametros.get("receber");
        if (!vendaId) return;

        setTimeout(() => {
            abrirRegistrarPagamento(Number(vendaId));
        }, 80);
    } catch (erro) {
        console.warn("Não foi possível abrir o recebimento solicitado.", erro);
    }
}


// =========================================
// CLIENTES
// =========================================

function carregarClientes() {

    const select = document.getElementById("clienteVenda");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Consumidor não identificado
        </option>
    `;

    const clientes = banco.clientes || [];

    clientes
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .forEach(cliente => {

            const option = document.createElement("option");

            option.value = cliente.id;

            option.textContent = cliente.nome;

            select.appendChild(option);

        });

}


// =========================================
// NÚMERO DA COMANDA
// =========================================

function gerarNumeroComanda() {

    const vendas = banco.vendas || [];

    const numero = vendas.length + 1;

    const comanda = String(numero).padStart(6, "0");

    const elemento = document.getElementById("numeroComanda");
    if (elemento) elemento.textContent = comanda;

    return comanda;

}


// =========================================
// BUSCA DE PRODUTOS
// =========================================

function configurarBuscaProduto() {

    const input = document.getElementById("buscarProduto");

    if (!input) return;

    input.addEventListener("input", () => {

        const termo = input.value
            .toLowerCase()
            .trim();

        const resultado = document.getElementById(
            "resultadoProdutos"
        );

        resultado.innerHTML = "";

        if (!termo) {

            resultado.style.display = "none";

            return;
        }

        const produtos = banco.produtos || [];

        const encontrados = produtos.filter(produto => {

            const nome = String(produto.nome || "")
                .toLowerCase();

            return nome.includes(termo);

        });

        if (encontrados.length === 0) {

            resultado.innerHTML = `
                <div class="product-result-empty">
                    Nenhum produto encontrado.
                </div>
            `;

            resultado.style.display = "block";

            return;
        }


        encontrados.forEach(produto => {

            const estoque = obterEstoqueProduto(produto);

            const div = document.createElement("div");

            div.className = "product-result";

            div.innerHTML = `

                <div>
                    <strong>
                        ${produto.nome}
                    </strong>

                    <small>
                        Estoque: ${estoque}
                    </small>
                </div>

                <strong>
                    ${formatarMoeda(produto.preco)}
                </strong>

            `;

            if (estoque <= 0) {

                div.classList.add("product-unavailable");

                div.innerHTML += `
                    <span class="stock-warning">
                        Sem estoque
                    </span>
                `;

            } else {

                div.addEventListener("click", () => {

                    adicionarProdutoVenda(produto.id);

                    input.value = "";

                    resultado.innerHTML = "";

                    resultado.style.display = "none";

                });

            }

            resultado.appendChild(div);

        });

        resultado.style.display = "block";

    });

}


// =========================================
// ESTOQUE
// =========================================

function obterEstoqueProduto(produto) {

    if (produto.estoque !== undefined) {

        return Number(produto.estoque) || 0;

    }

    if (produto.quantidade !== undefined) {

        return Number(produto.quantidade) || 0;

    }

    if (produto.quantidadeEstoque !== undefined) {

        return Number(produto.quantidadeEstoque) || 0;

    }

    return 0;

}


// =========================================
// ADICIONAR PRODUTO
// =========================================

function adicionarProdutoVenda(produtoId) {

    const produto = banco.produtos.find(
        p => Number(p.id) === Number(produtoId)
    );

    if (!produto) return;

    const estoque = obterEstoqueProduto(produto);

    if (estoque <= 0) {

        AppPopup.alert("Este produto está sem estoque.");

        return;

    }


    const existente = itensVenda.find(
        item => Number(item.produtoId) === Number(produtoId)
    );


    if (existente) {

        if (existente.quantidade >= estoque) {

            AppPopup.alert(
                `Estoque insuficiente.\n\nDisponível: ${estoque}`
            );

            return;
        }

        existente.quantidade++;

    } else {

        itensVenda.push({

            produtoId: produto.id,

            nome: produto.nome,

            preco: Number(produto.preco) || 0,

            quantidade: 1

        });

    }

    atualizarVenda();

}


// =========================================
// VALOR PERSONALIZADO / SALDO ANTERIOR
// =========================================

function abrirModalValorPersonalizado() {
    const modal = document.getElementById("modalValorPersonalizado");
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => document.getElementById("descricaoValorPersonalizado")?.focus(), 30);
}

function fecharModalValorPersonalizado() {
    const modal = document.getElementById("modalValorPersonalizado");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    const form = document.getElementById("formValorPersonalizado");
    if (form) form.reset();
}

function adicionarValorPersonalizado(event) {
    if (event) event.preventDefault();
    const descricao = String(document.getElementById("descricaoValorPersonalizado")?.value || "").trim();
    const valor = Number(document.getElementById("valorPersonalizado")?.value || 0);

    if (!descricao) {
        AppPopup.alert("Informe uma descrição para o valor personalizado.");
        return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
        AppPopup.alert("Informe um valor maior que zero.");
        return;
    }

    itensVenda.push({
        produtoId: null,
        chavePersonalizada: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        personalizado: true,
        tipo: "valor_personalizado",
        nome: descricao,
        preco: valor,
        quantidade: 1
    });

    fecharModalValorPersonalizado();
    atualizarVenda();
}

function removerValorPersonalizado(chave) {
    itensVenda = itensVenda.filter(item => item.chavePersonalizada !== chave);
    atualizarVenda();
}

// =========================================
// ALTERAR QUANTIDADE
// =========================================

function alterarQuantidade(produtoId, novaQuantidade) {

    const item = itensVenda.find(
        item => Number(item.produtoId) === Number(produtoId)
    );

    if (!item) return;

    const produto = banco.produtos.find(
        p => Number(p.id) === Number(produtoId)
    );

    if (!produto) return;

    const estoque = obterEstoqueProduto(produto);

    novaQuantidade = Number(novaQuantidade);


    if (novaQuantidade <= 0) {

        removerProdutoVenda(produtoId);

        return;

    }


    if (novaQuantidade > estoque) {

        AppPopup.alert(
            `Quantidade maior que o estoque disponível.\n\n` +
            `Disponível: ${estoque}`
        );

        atualizarVenda();

        return;
    }


    item.quantidade = novaQuantidade;

    atualizarVenda();

}


// =========================================
// REMOVER PRODUTO
// =========================================

function removerProdutoVenda(produtoId) {

    itensVenda = itensVenda.filter(
        item => Number(item.produtoId) !== Number(produtoId)
    );

    atualizarVenda();

}


// =========================================
// ATUALIZAR VENDA
// =========================================

function atualizarVenda() {
    const tbody = document.getElementById("listaVenda");
    if (!tbody) return;

    if (itensVenda.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-sale">
                <td colspan="5">Nenhum item adicionado.</td>
            </tr>`;
    } else {
        tbody.innerHTML = "";

        itensVenda.forEach(item => {
            const totalItem = Number(item.preco || 0) * Number(item.quantidade || 0);
            const tr = document.createElement("tr");

            if (item.personalizado) {
                const chave = String(item.chavePersonalizada || "").replace(/'/g, "\\'");
                const origemPedido = !!item.pedidoOrigemId;
                tr.className = "custom-value-row";
                tr.innerHTML = `
                    <td>
                        <strong>${escapeHtml(item.nome)}</strong>
                        <span class="custom-value-badge">${origemPedido ? "Valor do pedido" : "Valor personalizado"}</span>
                    </td>
                    <td>${formatarMoeda(item.preco)}</td>
                    <td><span class="custom-value-qty">1</span></td>
                    <td><strong>${formatarMoeda(totalItem)}</strong></td>
                    <td>${origemPedido ? '<span class="order-import-lock" title="Vinculado ao pedido">🔒</span>' : `<button class="btn-remove" type="button" onclick="removerValorPersonalizado('${chave}')" title="Remover">×</button>`}</td>`;
            } else if (item.estoqueJaBaixado) {
                tr.className = "order-imported-product-row";
                tr.innerHTML = `
                    <td><strong>${escapeHtml(item.nome)}</strong><span class="custom-value-badge order-stock-badge">Do pedido</span></td>
                    <td>${formatarMoeda(item.preco)}</td>
                    <td><span class="custom-value-qty">${Number(item.quantidade || 1)}</span></td>
                    <td><strong>${formatarMoeda(totalItem)}</strong></td>
                    <td><span class="order-import-lock" title="Estoque já baixado no pedido">🔒</span></td>`;
            } else {
                tr.innerHTML = `
                    <td><strong>${escapeHtml(item.nome)}</strong></td>
                    <td>${formatarMoeda(item.preco)}</td>
                    <td>
                        <input class="quantity-input" type="number" min="1" value="${Number(item.quantidade || 1)}"
                            onchange="alterarQuantidade(${Number(item.produtoId)}, this.value)">
                    </td>
                    <td><strong>${formatarMoeda(totalItem)}</strong></td>
                    <td>
                        <button class="btn-remove" type="button" onclick="removerProdutoVenda(${Number(item.produtoId)})" title="Remover">×</button>
                    </td>`;
            }
            tbody.appendChild(tr);
        });
    }
    calcularTotais();
}

// =========================================
// CÁLCULO
// =========================================

function calcularTotais() {

    const subtotal = itensVenda.reduce(
        (total, item) => {

            return total +
                (item.preco * item.quantidade);

        },
        0
    );


    const campoDesconto =
        document.getElementById("descontoVenda");


    let desconto =
        Number(campoDesconto?.value) || 0;


    if (desconto < 0) {

        desconto = 0;

    }


    if (desconto > subtotal) {

        desconto = subtotal;

        campoDesconto.value = subtotal.toFixed(2);

    }


    const total = subtotal - desconto;


    document.getElementById(
        "subtotalVenda"
    ).textContent = formatarMoeda(subtotal);


    document.getElementById(
        "totalVenda"
    ).textContent = formatarMoeda(total);

    atualizarParcelamentoCartao();

}


document.addEventListener("input", event => {

    if (event.target.id === "descontoVenda") {

        calcularTotais();

    }

});


// =========================================
// CARTÃO DE CRÉDITO / PARCELAMENTO
// =========================================

function configurarParcelamentoCartao() {
    const pagamentos = document.querySelectorAll('input[name="pagamento"]');
    const selectParcelas = document.getElementById("parcelasCredito");

    pagamentos.forEach(input => {
        input.addEventListener("change", atualizarParcelamentoCartao);
    });

    if (selectParcelas) {
        selectParcelas.addEventListener("change", atualizarParcelamentoCartao);
    }

    atualizarParcelamentoCartao();
}

function obterTotalAtualVenda() {
    const subtotal = itensVenda.reduce((total, item) => total + (Number(item.preco || 0) * Number(item.quantidade || 0)), 0);
    let desconto = Number(document.getElementById("descontoVenda")?.value) || 0;
    desconto = Math.max(0, Math.min(desconto, subtotal));
    return subtotal - desconto;
}

function obterParcelamentoCredito(total = obterTotalAtualVenda()) {
    const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value || "PIX";

    if (pagamento !== "Crédito") {
        return { parcelas: 1, valorParcela: Number(total || 0) };
    }

    const parcelas = Math.max(1, Math.min(12, Number(document.getElementById("parcelasCredito")?.value) || 1));
    const valorParcela = parcelas > 0 ? Number(total || 0) / parcelas : Number(total || 0);

    return { parcelas, valorParcela };
}

function atualizarParcelamentoCartao() {
    const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value || "PIX";
    const box = document.getElementById("creditInstallmentBox");

    if (!box) return;

    const credito = pagamento === "Crédito";
    box.hidden = !credito;

    if (!credito) return;

    const total = obterTotalAtualVenda();
    const { parcelas, valorParcela } = obterParcelamentoCredito(total);

    const valor = document.getElementById("valorParcelaCredito");
    const resumo = document.getElementById("resumoParcelamentoCredito");

    if (valor) valor.textContent = formatarMoeda(valorParcela);
    if (resumo) {
        resumo.textContent = parcelas === 1
            ? `Crédito à vista — ${formatarMoeda(total)}`
            : `${parcelas}x de ${formatarMoeda(valorParcela)} — Total ${formatarMoeda(total)}`;
    }
}

function descricaoPagamentoVenda(venda) {
    if (typeof formatarPagamentoVenda === "function") {
        return formatarPagamentoVenda(venda);
    }

    if (!venda || venda.pagamento !== "Crédito") return venda?.pagamento || "-";

    const parcelas = Math.max(1, Number(venda.parcelas || 1));
    const valorParcela = Number(venda.valorParcela || (Number(venda.total || 0) / parcelas));
    return parcelas === 1 ? "Crédito - à vista" : `Crédito - ${parcelas}x de ${formatarMoeda(valorParcela)}`;
}


// =========================================
// FINALIZAR VENDA
// =========================================

async function finalizarVenda() {
    if (itensVenda.length === 0) {
        AppPopup.alert("Adicione pelo menos um item à venda.");
        return;
    }

    banco = obterBanco();
    const clienteId = document.getElementById("clienteVenda").value;
    const cliente = clienteId ? banco.clientes.find(c => Number(c.id) === Number(clienteId)) : null;
    const subtotal = itensVenda.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    let desconto = Number(document.getElementById("descontoVenda").value) || 0;
    desconto = Math.max(0, Math.min(desconto, subtotal));
    const total = subtotal - desconto;
    const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value || "PIX";
    const { parcelas, valorParcela } = obterParcelamentoCredito(total);
    const statusPagamento = document.querySelector('input[name="statusPagamento"]:checked')?.value || "paga";

    for (const item of itensVenda) {
        if (item.personalizado || item.estoqueJaBaixado) continue;
        const produto = banco.produtos.find(p => Number(p.id) === Number(item.produtoId));
        if (!produto) { AppPopup.alert(`O produto "${item.nome}" não existe mais.`); return; }
        const estoque = obterEstoqueProduto(produto);
        if (item.quantidade > estoque) { AppPopup.alert(`Estoque insuficiente para ${item.nome}. Disponível: ${estoque}`); return; }
    }

    const numeroComanda = typeof gerarNumeroComanda === "function" ? gerarNumeroComanda() : String((banco.vendas?.length || 0) + 1).padStart(6, "0");
    const rotuloStatus = statusPagamento === "paga" ? "Paga" : "Aguardando pagamento";
    const rotuloPagamento = pagamento === "Crédito"
        ? (parcelas === 1 ? "Crédito - à vista" : `Crédito - ${parcelas}x de ${formatarMoeda(valorParcela)}`)
        : pagamento;
    if (!(await AppPopup.confirm(`Finalizar comanda #${numeroComanda}?\n\nCliente: ${cliente ? cliente.nome : "Consumidor não identificado"}\nTotal: ${formatarMoeda(total)}\nStatus: ${rotuloStatus}\nPagamento: ${rotuloPagamento}`))) return;

    itensVenda.forEach(item => {
        if (item.personalizado || item.estoqueJaBaixado) return;
        const produto = banco.produtos.find(p => Number(p.id) === Number(item.produtoId));
        if (!produto) return;
        if (produto.estoque !== undefined) produto.estoque = Number(produto.estoque) - item.quantidade;
        else if (produto.quantidade !== undefined) produto.quantidade = Number(produto.quantidade) - item.quantidade;
        else if (produto.quantidadeEstoque !== undefined) produto.quantidadeEstoque = Number(produto.quantidadeEstoque) - item.quantidade;
    });

    const agora = new Date().toISOString();
    const paga = statusPagamento === "paga";
    const venda = {
        id: Date.now(), comanda: numeroComanda,
        clienteId: cliente ? cliente.id : null,
        cliente: cliente ? cliente.nome : "Consumidor não identificado",
        produtos: itensVenda.map(item => ({ produtoId:item.produtoId ?? null, chavePersonalizada:item.chavePersonalizada || null, personalizado:!!item.personalizado, tipo:item.tipo || "produto", nome:item.nome, quantidade:item.quantidade, preco:item.preco, total:item.preco*item.quantidade, pedidoOrigemId:item.pedidoOrigemId ?? null, estoqueJaBaixado:!!item.estoqueJaBaixado })),
        pedidoId: window.pedidoImportadoVendaId || null,
        subtotal, desconto, total, pagamento,
        parcelas: pagamento === "Crédito" ? parcelas : 1,
        valorParcela: pagamento === "Crédito" ? valorParcela : total,
        statusPagamento: paga ? "paga" : "aguardando",
        valorPago: paga ? total : 0,
        valorPendente: paga ? 0 : total,
        pagamentos: paga ? [{ id:Date.now()+1, valor:total, formaPagamento:pagamento, parcelas: pagamento === "Crédito" ? parcelas : 1, valorParcela: pagamento === "Crédito" ? valorParcela : total, data:agora }] : [],
        dataPagamento: paga ? agora : null,
        data: agora
    };

    banco.vendas = Array.isArray(banco.vendas) ? banco.vendas : [];
    banco.caixa = Array.isArray(banco.caixa) ? banco.caixa : [];
    banco.vendas.push(venda);

    if (venda.pedidoId) {
        const pedidoVinculado = (banco.pedidos || []).find(p => String(p.id) === String(venda.pedidoId));
        if (pedidoVinculado) {
            pedidoVinculado.vendaId = venda.id;
            pedidoVinculado.convertidoEmVenda = true;
            pedidoVinculado.status = "concluido";
            pedidoVinculado.atualizadoEm = agora;
        }
    }

    if (paga && total > 0) {
        banco.caixa.push({ id:Date.now()+2, tipo:"entrada", categoria:"Venda", descricao:`Venda - Comanda #${numeroComanda}`, valor:total, formaPagamento:pagamento, parcelas: pagamento === "Crédito" ? parcelas : 1, valorParcela: pagamento === "Crédito" ? valorParcela : total, vendaId:venda.id, origem:"venda", data:agora });
    }

    salvarBanco(banco);
    AppPopup.alert(`Venda registrada com sucesso!\n\nComanda: #${numeroComanda}\nTotal: ${formatarMoeda(total)}\nStatus: ${rotuloStatus}`);

    itensVenda = [];
    window.pedidoImportadoVendaId = null;
    const avisoPedido = document.getElementById("pedidoImportadoAviso"); if (avisoPedido) avisoPedido.remove();
    try { if (new URLSearchParams(window.location.search).has("pedido")) history.replaceState({}, "", "vendas.html"); } catch (e) {}
    document.getElementById("clienteVenda").value = "";
    document.getElementById("descontoVenda").value = "0";
    const pix = document.querySelector('input[name="pagamento"][value="PIX"]'); if (pix) pix.checked = true;
    const parcelasCredito = document.getElementById("parcelasCredito"); if (parcelasCredito) parcelasCredito.value = "1";
    atualizarParcelamentoCartao();
    const statusPaga = document.querySelector('input[name="statusPagamento"][value="paga"]'); if (statusPaga) statusPaga.checked = true;
    gerarNumeroComanda();
    atualizarVenda();
    renderizarHistoricoVendas();
}

// =========================================
// CANCELAR
// =========================================

async function cancelarVendaAtual() {

    if (itensVenda.length === 0) {

        window.location.href = "index.html";

        return;

    }


    const confirmar = await AppPopup.confirm(
        "Deseja cancelar esta venda?"
    );


    if (!confirmar) return;


    itensVenda = [];

    atualizarVenda();

    document.getElementById(
        "clienteVenda"
    ).value = "";


    document.getElementById(
        "descontoVenda"
    ).value = "0";

}function devolverEstoqueItemVenda(bancoAtual, item) {
    if (!item || item.personalizado || item.produtoId == null) return;
    const produto = (bancoAtual.produtos || []).find(p => Number(p.id) === Number(item.produtoId));
    if (!produto) return;
    const quantidade = Number(item.quantidade || item.qtd || 0);
    if (produto.estoque !== undefined) produto.estoque = Number(produto.estoque || 0) + quantidade;
    else if (produto.quantidade !== undefined) produto.quantidade = Number(produto.quantidade || 0) + quantidade;
    else if (produto.quantidadeEstoque !== undefined) produto.quantidadeEstoque = Number(produto.quantidadeEstoque || 0) + quantidade;
    else produto.quantidade = quantidade;
}

function cancelarPedidoVinculadoDaVenda(bancoAtual, venda) {
    if (!venda?.pedidoId) return;
    const pedido = (bancoAtual.pedidos || []).find(p => String(p.id) === String(venda.pedidoId));
    if (!pedido) return;
    pedido.status = "cancelado";
    pedido.vendaId = null;
    pedido.convertidoEmVenda = false;
    pedido.estoqueRestaurado = true; // a devolução foi feita pelo cancelamento/exclusão da venda
    pedido.atualizadoEm = new Date().toISOString();
}

/* =====================================================
   CANCELAR VENDA
===================================================== */

async function cancelarVendaRegistrada(vendaId) {

    const banco =
        obterBanco();


    const venda =
        banco.vendas.find(
            v =>
                Number(v.id) ===
                Number(vendaId)
        );


    if (!venda) {

        AppPopup.alert(
            "Venda não encontrada."
        );

        return;

    }


    if (
        venda.status ===
        "cancelada"
    ) {

        AppPopup.alert(
            "Esta venda já foi cancelada."
        );

        return;

    }


    const confirmar =
        await AppPopup.confirm(

            "Cancelar esta venda?\n\n" +

            `Comanda: #${
                venda.comanda ||
                venda.id
            }\n` +

            `Total: ${
                formatarMoeda(
                    Number(venda.total || 0)
                )
            }\n\n` +

            "Os produtos retornarão ao estoque."

        );


    if (!confirmar) {
        return;
    }


    /* =========================================
       DEVOLVER PRODUTOS AO ESTOQUE
    ========================================== */

    if (Array.isArray(venda.produtos)) {
        venda.produtos.forEach(item => devolverEstoqueItemVenda(banco, item));
    }

    cancelarPedidoVinculadoDaVenda(banco, venda);


    /* =========================================
       MARCAR VENDA COMO CANCELADA
    ========================================== */

    venda.status =
        "cancelada";


    venda.canceladaEm =
        new Date().toISOString();


    /* =========================================
       ESTORNO NO CAIXA
    ========================================== */

    if (
        Array.isArray(
            banco.movimentacoes
        )
    ) {

        banco.movimentacoes.push({

            id: Date.now(),

            tipo: "saida",

            descricao:
                `Estorno da venda #${
                    venda.comanda ||
                    venda.id
                }`,

            valor:
                Number(
                    venda.total || 0
                ),

            pagamento:
                venda.pagamento || "",

            origem: "cancelamento",

            vendaId:
                venda.id,

            data:
                new Date().toISOString()

        });

    }


    salvarBanco(banco);


    AppPopup.alert(
        "Venda cancelada com sucesso!"
    );


    location.reload();

}

/* =====================================================
   HISTÓRICO DE VENDAS
===================================================== */

let vendaRegistradaAbertaId = null;

function configurarHistoricoVendas() {
    const busca = document.getElementById("buscarVendaRegistrada");
    const pagamento = document.getElementById("filtroPagamentoVenda");
    const status = document.getElementById("filtroStatusVenda");

    if (busca) busca.addEventListener("input", renderizarHistoricoVendas);
    if (pagamento) pagamento.addEventListener("change", renderizarHistoricoVendas);
    if (status) status.addEventListener("change", renderizarHistoricoVendas);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") fecharVendaRegistrada();
    });

    renderizarHistoricoVendas();
}

function renderizarHistoricoVendas() {
    const tbody = document.getElementById("listaVendasRegistradas");
    if (!tbody) return;
    banco = obterBanco();
    const termo = String(document.getElementById("buscarVendaRegistrada")?.value || "").trim().toLowerCase();
    const pagamento = document.getElementById("filtroPagamentoVenda")?.value || "";
    const status = document.getElementById("filtroStatusVenda")?.value || "";

    const vendas = [...(banco.vendas || [])].sort((a,b)=>new Date(b.data||0)-new Date(a.data||0)).filter(venda=>{
        const texto = `${venda.comanda||""} ${venda.cliente||""}`.toLowerCase();
        const financeiro = obterFinanceiroVenda(venda);
        const statusVenda = venda.status === "cancelada" ? "cancelada" : financeiro.statusPagamento;
        return (!termo || texto.includes(termo)) && (!pagamento || venda.pagamento === pagamento) && (!status || statusVenda === status);
    });

    const contador=document.getElementById("totalVendasRegistradas"); if(contador) contador.textContent=String((banco.vendas||[]).length);
    if(!vendas.length){ tbody.innerHTML='<tr><td colspan="10" class="sales-history-empty">Nenhuma venda encontrada.</td></tr>'; return; }

    tbody.innerHTML=vendas.map(venda=>{
        const produtos=Array.isArray(venda.produtos)?venda.produtos:[];
        const itens=produtos.reduce((t,i)=>t+Number(i.quantidade||i.qtd||0),0);
        const cancelada=venda.status==="cancelada";
        const f=obterFinanceiroVenda(venda);
        const statusClass=cancelada?'cancelled':f.statusPagamento==='paga'?'paid':'waiting';
        const statusLabel=cancelada?'Cancelada':f.statusPagamento==='paga'?'Paga':'Aguardando pagamento';
        return `<tr class="${cancelada?'sale-row-cancelled':''}">
            <td><strong>#${escapeHtml(venda.comanda||String(venda.id||''))}</strong></td><td>${escapeHtml(venda.cliente||'Consumidor não identificado')}</td><td>${formatarData(venda.data)}</td>
            <td><span class="sale-payment-badge">${escapeHtml(descricaoPagamentoVenda(venda))}</span></td><td>${itens}</td><td><strong>${formatarMoeda(venda.total)}</strong></td>
            <td class="money-paid">${formatarMoeda(f.valorPago)}</td><td class="money-pending">${formatarMoeda(f.valorPendente)}</td>
            <td><span class="sale-status-badge ${statusClass}">${statusLabel}</span></td>
            <td><div class="sale-history-actions">
                <button type="button" class="sale-history-action view" onclick="abrirVendaRegistrada(${Number(venda.id)})"><span>Ver</span></button>
                <button type="button" class="sale-history-action print" onclick="imprimirComanda(${Number(venda.id)})"><span>Imprimir</span></button>
                ${!cancelada && f.valorPendente>0 ? `<button type="button" class="sale-history-action receive" onclick="abrirRegistrarPagamento(${Number(venda.id)})"><span>Receber</span></button>`:''}
                <button type="button" class="sale-history-action delete" onclick="excluirVendaRegistrada(${Number(venda.id)})"><span>Excluir</span></button>
            </div></td></tr>`;
    }).join('');
}


/* =====================================================
   EXCLUIR VENDA DO HISTÓRICO
   Remove definitivamente a venda e desfaz os efeitos
   diretamente vinculados a ela no estoque e no caixa.
===================================================== */

async function excluirVendaRegistrada(vendaId) {
    const bancoAtual = obterBanco();
    const indice = (bancoAtual.vendas || []).findIndex(
        venda => Number(venda.id) === Number(vendaId)
    );

    if (indice === -1) {
        AppPopup.alert("Venda não encontrada.");
        return;
    }

    const venda = bancoAtual.vendas[indice];
    const financeiro = obterFinanceiroVenda(venda);
    const comanda = venda.comanda || venda.id;

    const aviso =
        `Excluir definitivamente a comanda #${comanda}?\n\n` +
        `Cliente: ${venda.cliente || "Consumidor não identificado"}\n` +
        `Total: ${formatarMoeda(venda.total)}\n` +
        `Pago: ${formatarMoeda(financeiro.valorPago)}\n\n` +
        "A venda será removida do histórico. " +
        (venda.status === "cancelada"
            ? "Como ela já está cancelada, o estoque não será devolvido novamente."
            : "Os produtos retornarão ao estoque e os lançamentos financeiros vinculados à venda serão removidos.") +
        "\n\nEsta ação não pode ser desfeita.";

    if (!(await AppPopup.confirm(aviso))) return;

    // Se a venda ainda não estava cancelada, devolve os itens ao estoque.
    if (venda.status !== "cancelada" && Array.isArray(venda.produtos)) {
        venda.produtos.forEach(item => devolverEstoqueItemVenda(bancoAtual, item));
        cancelarPedidoVinculadoDaVenda(bancoAtual, venda);
    }

    // Remove movimentações financeiras que pertencem especificamente à venda.
    const removerLancamentosDaVenda = lista =>
        Array.isArray(lista)
            ? lista.filter(item => Number(item.vendaId) !== Number(venda.id))
            : [];

    bancoAtual.caixa = removerLancamentosDaVenda(bancoAtual.caixa);
    bancoAtual.entradasCaixa = removerLancamentosDaVenda(bancoAtual.entradasCaixa);
    bancoAtual.saidasCaixa = removerLancamentosDaVenda(bancoAtual.saidasCaixa);
    bancoAtual.movimentacoes = removerLancamentosDaVenda(bancoAtual.movimentacoes);

    // Remove a venda definitivamente.
    bancoAtual.vendas.splice(indice, 1);

    salvarBanco(bancoAtual);

    if (vendaRegistradaAbertaId && Number(vendaRegistradaAbertaId) === Number(venda.id)) {
        fecharVendaRegistrada();
    }

    renderizarHistoricoVendas();

    AppPopup.alert(`Comanda #${comanda} removida do histórico com sucesso.`);
}

function abrirVendaRegistrada(vendaId) {
    banco = obterBanco();
    const venda = (banco.vendas || []).find(v => Number(v.id) === Number(vendaId));
    if (!venda) {
        AppPopup.alert("Venda não encontrada.");
        return;
    }

    vendaRegistradaAbertaId = venda.id;
    const produtos = Array.isArray(venda.produtos) ? venda.produtos : [];
    const totalItens = produtos.reduce((total, item) => total + Number(item.quantidade || item.qtd || 0), 0);

    document.getElementById("tituloVendaRegistrada").textContent = `Comanda #${venda.comanda || venda.id}`;
    document.getElementById("vendaRegistradaCliente").textContent = venda.cliente || "Consumidor não identificado";
    document.getElementById("vendaRegistradaData").textContent = formatarData(venda.data);
    document.getElementById("vendaRegistradaPagamento").textContent = descricaoPagamentoVenda(venda);
    const financeiroVenda = obterFinanceiroVenda(venda);
    document.getElementById("vendaRegistradaStatus").textContent = venda.status === "cancelada" ? "Cancelada" : (financeiroVenda.statusPagamento === "paga" ? "Paga" : "Aguardando pagamento");
    document.getElementById("vendaRegistradaPago").textContent = formatarMoeda(financeiroVenda.valorPago);
    document.getElementById("vendaRegistradaPendente").textContent = formatarMoeda(financeiroVenda.valorPendente);
    document.getElementById("vendaRegistradaItens").textContent = `${totalItens} ${totalItens === 1 ? "item" : "itens"}`;
    document.getElementById("vendaRegistradaSubtotal").textContent = formatarMoeda(venda.subtotal);
    document.getElementById("vendaRegistradaDesconto").textContent = formatarMoeda(venda.desconto);
    document.getElementById("vendaRegistradaTotal").textContent = formatarMoeda(venda.total);

    const tbody = document.getElementById("vendaRegistradaProdutos");
    tbody.innerHTML = produtos.length ? produtos.map(item => {
        const quantidade = Number(item.quantidade || item.qtd || 0);
        const preco = Number(item.preco || item.precoVenda || item.valor || 0);
        const total = Number(item.total ?? (preco * quantidade));
        return `
            <tr>
                <td><strong>${escapeHtml(item.nome || item.produto || "Produto")}</strong></td>
                <td>${quantidade}</td>
                <td>${formatarMoeda(preco)}</td>
                <td><strong>${formatarMoeda(total)}</strong></td>
            </tr>
        `;
    }).join("") : `<tr><td colspan="4" class="sale-record-empty">Nenhum item encontrado nesta venda.</td></tr>`;

    const botaoImprimir = document.getElementById("btnImprimirVendaRegistrada");
    if (botaoImprimir) botaoImprimir.onclick = () => imprimirComanda(venda.id);

    const modal = document.getElementById("modalVendaRegistrada");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sale-record-modal-open");
}

function fecharVendaRegistrada() {
    const modal = document.getElementById("modalVendaRegistrada");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sale-record-modal-open");
    vendaRegistradaAbertaId = null;
}


function mostrarTelaVendas(tela) {
    const nova = document.getElementById("novaVendaSection");
    const historico = document.getElementById("historicoVendas");
    const btnNova = document.getElementById("btnNovaVendaView");
    const btnHistorico = document.getElementById("btnHistoricoVendaView");

    const mostrarHistorico = tela === "historico";

    if (nova) nova.classList.toggle("sales-view-hidden", mostrarHistorico);
    if (historico) historico.classList.toggle("sales-view-hidden", !mostrarHistorico);
    if (btnNova) btnNova.classList.toggle("active", !mostrarHistorico);
    if (btnHistorico) btnHistorico.classList.toggle("active", mostrarHistorico);

    if (mostrarHistorico) {
        renderizarHistoricoVendas();
        setTimeout(() => historico?.scrollIntoView({ behavior: "smooth", block: "start" }), 10);
    }
}


/* =====================================================
   RECEBIMENTOS DE VENDAS PENDENTES
===================================================== */
let vendaPagamentoAbertaId = null;

function abrirRegistrarPagamento(vendaId) {
    banco = obterBanco();
    const venda=(banco.vendas||[]).find(v=>Number(v.id)===Number(vendaId));
    if(!venda || venda.status==='cancelada') return;
    const f=obterFinanceiroVenda(venda);
    if(f.valorPendente<=0){ AppPopup.alert('Esta venda já está totalmente paga.'); return; }
    vendaPagamentoAbertaId=venda.id;
    document.getElementById('tituloRegistrarPagamento').textContent=`Receber comanda #${venda.comanda||venda.id}`;
    document.getElementById('pagamentoCliente').textContent=venda.cliente||'Consumidor não identificado';
    document.getElementById('pagamentoSaldoPendente').textContent=formatarMoeda(f.valorPendente);
    const valor=document.getElementById('valorNovoPagamento'); valor.max=String(f.valorPendente); valor.value=f.valorPendente.toFixed(2);
    const forma=document.getElementById('formaNovoPagamento'); if(forma) forma.value=venda.pagamento||'PIX';
    const statusAguardando=document.querySelector('input[name="novoStatusPagamento"][value="aguardando"]');
    if(statusAguardando) statusAguardando.checked=true;
    atualizarModoNovoPagamento();
    const modal=document.getElementById('modalRegistrarPagamento'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}

function atualizarModoNovoPagamento(){
    const status=document.querySelector('input[name="novoStatusPagamento"]:checked')?.value || 'aguardando';
    const valor=document.getElementById('valorNovoPagamento');
    const botao=document.getElementById('btnConfirmarNovoPagamento');
    if(!valor) return;
    if(status==='paga'){
        const bancoAtual=obterBanco();
        const venda=(bancoAtual.vendas||[]).find(v=>Number(v.id)===Number(vendaPagamentoAbertaId));
        if(venda){
            const f=obterFinanceiroVenda(venda);
            valor.value=Number(f.valorPendente||0).toFixed(2);
            valor.readOnly=true;
        }
        if(botao){ const texto=botao.querySelector('span'); if(texto) texto.textContent='Salvar como paga'; }
    }else{
        valor.readOnly=false;
        if(botao){ const texto=botao.querySelector('span'); if(texto) texto.textContent='Salvar alterações'; }
    }
}

document.addEventListener('change',function(event){
    if(event.target && event.target.name==='novoStatusPagamento') atualizarModoNovoPagamento();
});
function fecharRegistrarPagamento(){ const modal=document.getElementById('modalRegistrarPagamento'); if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');} vendaPagamentoAbertaId=null; }
function confirmarNovoPagamento(){
    if(!vendaPagamentoAbertaId) return;
    banco=obterBanco();
    const venda=(banco.vendas||[]).find(v=>Number(v.id)===Number(vendaPagamentoAbertaId)); if(!venda) return;
    const f=obterFinanceiroVenda(venda);
    const statusEscolhido=document.querySelector('input[name="novoStatusPagamento"]:checked')?.value || 'aguardando';
    let valor=Math.round((Number(document.getElementById('valorNovoPagamento').value)||0)*100)/100;
    const forma=document.getElementById('formaNovoPagamento').value||'PIX';
    if(statusEscolhido==='paga') valor=Math.round(f.valorPendente*100)/100;
    if(valor<=0){AppPopup.alert('Informe um valor maior que zero.');return;}
    if(valor>f.valorPendente+0.009){AppPopup.alert(`O valor não pode ser maior que o saldo pendente (${formatarMoeda(f.valorPendente)}).`);return;}
    const agora=new Date().toISOString();
    venda.pagamentos=Array.isArray(venda.pagamentos)?venda.pagamentos:[];
    venda.pagamentos.push({id:Date.now(),valor,formaPagamento:forma,data:agora});
    venda.valorPago=Math.min(Number(venda.total||0),f.valorPago+valor);
    venda.valorPendente=Math.max(0,Number(venda.total||0)-venda.valorPago);
    venda.statusPagamento=venda.valorPendente<=0.009?'paga':'aguardando';
    if(venda.statusPagamento==='paga'){venda.valorPendente=0;venda.dataPagamento=agora;}
    banco.caixa=Array.isArray(banco.caixa)?banco.caixa:[];
    banco.caixa.push({id:Date.now()+1,tipo:'entrada',categoria:'Recebimento de venda',descricao:`Recebimento - Comanda #${venda.comanda||venda.id}`,valor,formaPagamento:forma,vendaId:venda.id,origem:'recebimento_venda',data:agora});
    salvarBanco(banco); fecharRegistrarPagamento(); renderizarHistoricoVendas();
    AppPopup.alert(`Pagamento registrado com sucesso!\nRecebido: ${formatarMoeda(valor)}\nSaldo: ${formatarMoeda(venda.valorPendente)}`);
}
