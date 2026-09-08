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

});


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

        alert("Este produto está sem estoque.");

        return;

    }


    const existente = itensVenda.find(
        item => Number(item.produtoId) === Number(produtoId)
    );


    if (existente) {

        if (existente.quantidade >= estoque) {

            alert(
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

        alert(
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

                <td colspan="5">
                    Nenhum produto adicionado.
                </td>

            </tr>

        `;

    } else {

        tbody.innerHTML = "";


        itensVenda.forEach(item => {

            const totalItem =
                item.preco * item.quantidade;


            const tr = document.createElement("tr");

            tr.innerHTML = `

                <td>

                    <strong>
                        ${item.nome}
                    </strong>

                </td>


                <td>
                    ${formatarMoeda(item.preco)}
                </td>


                <td>

                    <input
                        class="quantity-input"
                        type="number"
                        min="1"
                        value="${item.quantidade}"
                        onchange="
                            alterarQuantidade(
                                ${item.produtoId},
                                this.value
                            )
                        "
                    >

                </td>


                <td>

                    <strong>
                        ${formatarMoeda(totalItem)}
                    </strong>

                </td>


                <td>

                    <button
                        class="btn-remove"
                        onclick="
                            removerProdutoVenda(
                                ${item.produtoId}
                            )
                        "
                        title="Remover">

                        ×

                    </button>

                </td>

            `;

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

}


document.addEventListener("input", event => {

    if (event.target.id === "descontoVenda") {

        calcularTotais();

    }

});


// =========================================
// FINALIZAR VENDA
// =========================================

function finalizarVenda() {
    if (itensVenda.length === 0) {
        alert("Adicione pelo menos um produto à venda.");
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
    const statusPagamento = document.querySelector('input[name="statusPagamento"]:checked')?.value || "paga";

    for (const item of itensVenda) {
        const produto = banco.produtos.find(p => Number(p.id) === Number(item.produtoId));
        if (!produto) { alert(`O produto "${item.nome}" não existe mais.`); return; }
        const estoque = obterEstoqueProduto(produto);
        if (item.quantidade > estoque) { alert(`Estoque insuficiente para ${item.nome}. Disponível: ${estoque}`); return; }
    }

    const numeroComanda = typeof gerarNumeroComanda === "function" ? gerarNumeroComanda() : String((banco.vendas?.length || 0) + 1).padStart(6, "0");
    const rotuloStatus = statusPagamento === "paga" ? "Paga" : "Aguardando pagamento";
    if (!confirm(`Finalizar comanda #${numeroComanda}?\n\nCliente: ${cliente ? cliente.nome : "Consumidor não identificado"}\nTotal: ${formatarMoeda(total)}\nStatus: ${rotuloStatus}\nPagamento: ${pagamento}`)) return;

    itensVenda.forEach(item => {
        const produto = banco.produtos.find(p => Number(p.id) === Number(item.produtoId));
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
        produtos: itensVenda.map(item => ({ produtoId:item.produtoId, nome:item.nome, quantidade:item.quantidade, preco:item.preco, total:item.preco*item.quantidade })),
        subtotal, desconto, total, pagamento,
        statusPagamento: paga ? "paga" : "aguardando",
        valorPago: paga ? total : 0,
        valorPendente: paga ? 0 : total,
        pagamentos: paga ? [{ id:Date.now()+1, valor:total, formaPagamento:pagamento, data:agora }] : [],
        dataPagamento: paga ? agora : null,
        data: agora
    };

    banco.vendas = Array.isArray(banco.vendas) ? banco.vendas : [];
    banco.caixa = Array.isArray(banco.caixa) ? banco.caixa : [];
    banco.vendas.push(venda);

    if (paga && total > 0) {
        banco.caixa.push({ id:Date.now()+2, tipo:"entrada", categoria:"Venda", descricao:`Venda - Comanda #${numeroComanda}`, valor:total, formaPagamento:pagamento, vendaId:venda.id, origem:"venda", data:agora });
    }

    salvarBanco(banco);
    alert(`Venda registrada com sucesso!\n\nComanda: #${numeroComanda}\nTotal: ${formatarMoeda(total)}\nStatus: ${rotuloStatus}`);

    itensVenda = [];
    document.getElementById("clienteVenda").value = "";
    document.getElementById("descontoVenda").value = "0";
    const pix = document.querySelector('input[name="pagamento"][value="PIX"]'); if (pix) pix.checked = true;
    const statusPaga = document.querySelector('input[name="statusPagamento"][value="paga"]'); if (statusPaga) statusPaga.checked = true;
    gerarNumeroComanda();
    atualizarVenda();
    renderizarHistoricoVendas();
}

// =========================================
// CANCELAR
// =========================================

function cancelarVendaAtual() {

    if (itensVenda.length === 0) {

        window.location.href = "index.html";

        return;

    }


    const confirmar = confirm(
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

}/* =====================================================
   CANCELAR VENDA
===================================================== */

function cancelarVendaRegistrada(vendaId) {

    const banco =
        obterBanco();


    const venda =
        banco.vendas.find(
            v =>
                Number(v.id) ===
                Number(vendaId)
        );


    if (!venda) {

        alert(
            "Venda não encontrada."
        );

        return;

    }


    if (
        venda.status ===
        "cancelada"
    ) {

        alert(
            "Esta venda já foi cancelada."
        );

        return;

    }


    const confirmar =
        confirm(

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

    if (
        Array.isArray(venda.produtos)
    ) {

        venda.produtos.forEach(item => {

            const produto =
                banco.produtos.find(
                    p =>
                        Number(p.id) ===
                        Number(
                            item.produtoId
                        )
                );


            if (produto) {

                produto.estoque =
                    Number(
                        produto.estoque || 0
                    ) +
                    Number(
                        item.quantidade ||
                        item.qtd ||
                        0
                    );

            }

        });

    }


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


    alert(
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
            <td><span class="sale-payment-badge">${escapeHtml(venda.pagamento||'-')}</span></td><td>${itens}</td><td><strong>${formatarMoeda(venda.total)}</strong></td>
            <td class="money-paid">${formatarMoeda(f.valorPago)}</td><td class="money-pending">${formatarMoeda(f.valorPendente)}</td>
            <td><span class="sale-status-badge ${statusClass}">${statusLabel}</span></td>
            <td><div class="sale-history-actions">
                <button type="button" class="sale-history-action view" onclick="abrirVendaRegistrada(${Number(venda.id)})"><span>Ver</span></button>
                <button type="button" class="sale-history-action print" onclick="imprimirComanda(${Number(venda.id)})"><span>Imprimir</span></button>
                ${!cancelada && f.valorPendente>0 ? `<button type="button" class="sale-history-action receive" onclick="abrirRegistrarPagamento(${Number(venda.id)})"><span>Receber</span></button>`:''}
            </div></td></tr>`;
    }).join('');
}

function abrirVendaRegistrada(vendaId) {
    banco = obterBanco();
    const venda = (banco.vendas || []).find(v => Number(v.id) === Number(vendaId));
    if (!venda) {
        alert("Venda não encontrada.");
        return;
    }

    vendaRegistradaAbertaId = venda.id;
    const produtos = Array.isArray(venda.produtos) ? venda.produtos : [];
    const totalItens = produtos.reduce((total, item) => total + Number(item.quantidade || item.qtd || 0), 0);

    document.getElementById("tituloVendaRegistrada").textContent = `Comanda #${venda.comanda || venda.id}`;
    document.getElementById("vendaRegistradaCliente").textContent = venda.cliente || "Consumidor não identificado";
    document.getElementById("vendaRegistradaData").textContent = formatarData(venda.data);
    document.getElementById("vendaRegistradaPagamento").textContent = venda.pagamento || "-";
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
    if(f.valorPendente<=0){ alert('Esta venda já está totalmente paga.'); return; }
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
    if(valor<=0){alert('Informe um valor maior que zero.');return;}
    if(valor>f.valorPendente+0.009){alert(`O valor não pode ser maior que o saldo pendente (${formatarMoeda(f.valorPendente)}).`);return;}
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
    alert(`Pagamento registrado com sucesso!\nRecebido: ${formatarMoeda(valor)}\nSaldo: ${formatarMoeda(venda.valorPendente)}`);
}
