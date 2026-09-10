/* ==================================================
   MARCELINO BORDADOS — PEDIDOS v21
   Pedidos + estoque + venda + consulta + impressão
   ================================================== */
let pedidoBanco = null;
let itensNovoPedido = [];
let pedidoDetalheAtualId = null;

function pedidoEscape(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function rotuloStatusPedido(status) {
    if (status === "concluido") return "Concluído";
    if (status === "cancelado") return "Cancelado";
    return "Em produção";
}
function estoqueProdutoPedido(produto) {
    if (!produto) return 0;
    if (produto.estoque !== undefined) return Number(produto.estoque) || 0;
    if (produto.quantidade !== undefined) return Number(produto.quantidade) || 0;
    if (produto.quantidadeEstoque !== undefined) return Number(produto.quantidadeEstoque) || 0;
    return 0;
}
function alterarEstoqueProdutoPedido(produto, delta) {
    if (produto.estoque !== undefined) produto.estoque = Number(produto.estoque || 0) + delta;
    else if (produto.quantidade !== undefined) produto.quantidade = Number(produto.quantidade || 0) + delta;
    else if (produto.quantidadeEstoque !== undefined) produto.quantidadeEstoque = Number(produto.quantidadeEstoque || 0) + delta;
    else produto.quantidade = delta;
}
function carregarClientesPedido() {
    pedidoBanco = obterBanco();
    const select = document.getElementById("pedidoCliente");
    if (!select) return;
    select.innerHTML = '<option value="">Consumidor não identificado</option>';
    [...(pedidoBanco.clientes || [])].sort((a,b)=>String(a.nome||"").localeCompare(String(b.nome||""))).forEach(cliente => {
        const op = document.createElement("option"); op.value = cliente.id; op.textContent = cliente.nome || "Cliente"; select.appendChild(op);
    });
}
function carregarProdutosPedido() {
    pedidoBanco = obterBanco();
    const select = document.getElementById("pedidoProduto");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    [...(pedidoBanco.produtos || [])].sort((a,b)=>String(a.nome||"").localeCompare(String(b.nome||""))).forEach(produto => {
        const estoque = estoqueProdutoPedido(produto);
        const op = document.createElement("option");
        op.value = produto.id; op.disabled = estoque <= 0;
        op.textContent = `${produto.nome || "Produto"} — estoque ${estoque} — ${formatarMoeda(produto.preco || 0)}`;
        select.appendChild(op);
    });
}
function abrirModalPedido() {
    itensNovoPedido = [];
    carregarClientesPedido(); carregarProdutosPedido(); renderizarItensNovoPedido();
    document.getElementById("formPedido")?.reset();
    const qtd = document.getElementById("pedidoQuantidade"); if (qtd) qtd.value = "1";
    const modal = document.getElementById("modalPedido"); if (!modal) return;
    modal.classList.add("active"); modal.setAttribute("aria-hidden", "false");
    setTimeout(()=>document.getElementById("pedidoTitulo")?.focus(), 40);
}
function fecharModalPedido() {
    const modal = document.getElementById("modalPedido"); if (!modal) return;
    modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true");
}
function adicionarItemPedido() {
    pedidoBanco = obterBanco();
    const produtoId = document.getElementById("pedidoProduto")?.value;
    const quantidade = Math.max(1, Math.floor(Number(document.getElementById("pedidoQuantidade")?.value || 1)));
    if (!produtoId) { AppPopup.alert("Selecione um produto."); return; }
    const produto = (pedidoBanco.produtos || []).find(p => String(p.id) === String(produtoId));
    if (!produto) { AppPopup.alert("Produto não encontrado."); return; }
    const estoque = estoqueProdutoPedido(produto);
    const existente = itensNovoPedido.find(i => String(i.produtoId) === String(produto.id));
    const totalSolicitado = quantidade + (existente ? existente.quantidade : 0);
    if (totalSolicitado > estoque) { AppPopup.alert(`Estoque insuficiente para ${produto.nome}.\nDisponível: ${estoque}`); return; }
    if (existente) existente.quantidade = totalSolicitado;
    else itensNovoPedido.push({ produtoId: produto.id, nome: produto.nome, preco: Number(produto.preco || 0), quantidade });
    document.getElementById("pedidoProduto").value = ""; document.getElementById("pedidoQuantidade").value = "1";
    renderizarItensNovoPedido();
}
function removerItemPedido(produtoId) { itensNovoPedido = itensNovoPedido.filter(i => String(i.produtoId) !== String(produtoId)); renderizarItensNovoPedido(); }
function calcularTotalNovoPedido() {
    const produtos = itensNovoPedido.reduce((t,i)=>t + Number(i.preco||0)*Number(i.quantidade||0),0);
    const adicional = Math.max(0, Number(document.getElementById("pedidoValor")?.value || 0));
    return { produtos, adicional, total: produtos + adicional };
}
function renderizarItensNovoPedido() {
    const el = document.getElementById("pedidoItensLista"); if (!el) return;
    if (!itensNovoPedido.length) el.innerHTML = '<div class="order-items-empty">Nenhum item adicionado.</div>';
    else el.innerHTML = itensNovoPedido.map(i=>`<div class="order-item-line"><div><strong>${pedidoEscape(i.nome)}</strong><span>${i.quantidade} × ${formatarMoeda(i.preco)}</span></div><strong>${formatarMoeda(i.preco*i.quantidade)}</strong><button type="button" onclick="removerItemPedido('${pedidoEscape(i.produtoId)}')" aria-label="Remover item">×</button></div>`).join("");
    const resumo = calcularTotalNovoPedido(); const total = document.getElementById("pedidoTotalPreview"); if (total) total.textContent = formatarMoeda(resumo.total);
}
function salvarPedido(event) {
    event.preventDefault(); pedidoBanco = obterBanco(); pedidoBanco.pedidos = Array.isArray(pedidoBanco.pedidos) ? pedidoBanco.pedidos : [];
    const clienteIdRaw = document.getElementById("pedidoCliente")?.value || "";
    const cliente = clienteIdRaw ? (pedidoBanco.clientes || []).find(c => String(c.id) === String(clienteIdRaw)) : null;
    const titulo = String(document.getElementById("pedidoTitulo")?.value || "").trim();
    const descricao = String(document.getElementById("pedidoDescricao")?.value || "").trim();
    const prazo = document.getElementById("pedidoPrazo")?.value || null;
    const status = document.getElementById("pedidoStatus")?.value || "producao";
    const valores = calcularTotalNovoPedido();
    if (!titulo) { AppPopup.alert("Informe o pedido."); return; }
    if (!itensNovoPedido.length && valores.adicional <= 0) { AppPopup.alert("Adicione ao menos um produto ou informe um valor adicional."); return; }
    for (const item of itensNovoPedido) {
        const prod=(pedidoBanco.produtos||[]).find(p=>String(p.id)===String(item.produtoId));
        if (!prod || estoqueProdutoPedido(prod) < item.quantidade) { AppPopup.alert(`Estoque insuficiente para ${item.nome}.`); return; }
    }
    const agora = new Date().toISOString();
    const proximoNumero = pedidoBanco.pedidos.reduce((m,p)=>Math.max(m, Number(p.numero||0)),0) + 1;
    const pedidoId = Date.now();
    const itens = itensNovoPedido.map(i=>({produtoId:i.produtoId,nome:i.nome,preco:Number(i.preco||0),quantidade:Number(i.quantidade||0),total:Number(i.preco||0)*Number(i.quantidade||0)}));
    // Reserva/baixa de estoque no momento do pedido.
    itens.forEach((item, idx)=>{
        const prod=(pedidoBanco.produtos||[]).find(p=>String(p.id)===String(item.produtoId));
        if (prod) alterarEstoqueProdutoPedido(prod, -item.quantidade);
        pedidoBanco.estoqueMovimentacoes = Array.isArray(pedidoBanco.estoqueMovimentacoes) ? pedidoBanco.estoqueMovimentacoes : [];
        pedidoBanco.estoqueMovimentacoes.push({id:pedidoId+idx+1, produtoId:item.produtoId, produto:item.nome, tipo:"saida", quantidade:item.quantidade, motivo:`Pedido #${String(proximoNumero).padStart(4,"0")}`, origem:"pedido", pedidoId, data:agora});
    });
    pedidoBanco.pedidos.push({
        id:pedidoId, numero:proximoNumero, clienteId:cliente?cliente.id:null, cliente:cliente?cliente.nome:"Consumidor não identificado",
        titulo, descricao, prazo, valor:valores.total, valorProdutos:valores.produtos, valorAdicional:valores.adicional,
        itens, estoqueBaixado:true, status, vendaId:null, criadoEm:agora, atualizadoEm:agora
    });
    salvarBanco(pedidoBanco); fecharModalPedido(); itensNovoPedido=[]; renderizarPedidos();
    AppPopup.alert(`Pedido #${String(proximoNumero).padStart(4,"0")} salvo.\nOs itens foram retirados do estoque.`);
}
async function alterarStatusPedido(id, status) {
    pedidoBanco = obterBanco(); const pedido=(pedidoBanco.pedidos||[]).find(p=>Number(p.id)===Number(id)); if(!pedido)return;
    if (status === "cancelado" && pedido.status !== "cancelado") {
        if (pedido.vendaId) { AppPopup.alert("Este pedido já foi convertido em venda. Cancele a venda pelo histórico de vendas, se necessário."); renderizarPedidos(); return; }
        if (!(await AppPopup.confirm(`Cancelar o pedido #${String(pedido.numero||"").padStart(4,"0")} de ${pedido.cliente}?\n\nOs itens voltarão ao estoque.`))) { renderizarPedidos(); return; }
        restaurarEstoquePedido(pedido);
    }
    if (pedido.status === "cancelado" && status !== "cancelado") { AppPopup.alert("Um pedido cancelado não pode ser reaberto automaticamente porque o estoque já foi devolvido. Crie um novo pedido."); renderizarPedidos(); return; }
    pedido.status=status; pedido.atualizadoEm=new Date().toISOString(); salvarBanco(pedidoBanco); renderizarPedidos();
}
function restaurarEstoquePedido(pedido) {
    if (!pedido?.estoqueBaixado || pedido.estoqueRestaurado) return;
    pedidoBanco.estoqueMovimentacoes = Array.isArray(pedidoBanco.estoqueMovimentacoes)?pedidoBanco.estoqueMovimentacoes:[];
    (pedido.itens||[]).forEach((item,idx)=>{
        const prod=(pedidoBanco.produtos||[]).find(p=>String(p.id)===String(item.produtoId)); if(prod) alterarEstoqueProdutoPedido(prod, Number(item.quantidade||0));
        pedidoBanco.estoqueMovimentacoes.push({id:Date.now()+idx,produtoId:item.produtoId,produto:item.nome,tipo:"entrada",quantidade:Number(item.quantidade||0),motivo:`Cancelamento pedido #${String(pedido.numero||0).padStart(4,"0")}`,origem:"cancelamento_pedido",pedidoId:pedido.id,data:new Date().toISOString()});
    });
    pedido.estoqueRestaurado=true;
}
function cancelarPedido(id){alterarStatusPedido(id,"cancelado");}

async function excluirPedido(id) {
    pedidoBanco = obterBanco();
    pedidoBanco.pedidos = Array.isArray(pedidoBanco.pedidos) ? pedidoBanco.pedidos : [];

    const indice = pedidoBanco.pedidos.findIndex(p => Number(p.id) === Number(id));
    if (indice < 0) {
        AppPopup.alert("Pedido não encontrado.");
        return;
    }

    const pedido = pedidoBanco.pedidos[indice];
    const numero = String(pedido.numero || 0).padStart(4, "0");
    const total = formatarMoeda(totalPedido(pedido));

    let aviso = `Excluir definitivamente o pedido #${numero}?\n\nCliente: ${pedido.cliente || "Consumidor não identificado"}\nTotal: ${total}`;

    if (pedido.vendaId) {
        aviso += "\n\nEste pedido já possui uma venda vinculada. A venda será mantida e NÃO haverá alteração no estoque.";
    } else if (pedido.estoqueBaixado && !pedido.estoqueRestaurado) {
        aviso += "\n\nOs itens deste pedido serão devolvidos ao estoque antes da exclusão.";
    }

    aviso += "\n\nEsta ação não poderá ser desfeita.";

    if (!(await AppPopup.confirm(aviso))) return;

    // Se o pedido ainda não virou venda e os itens continuam baixados, devolve o estoque.
    if (!pedido.vendaId && pedido.estoqueBaixado && !pedido.estoqueRestaurado) {
        (pedido.itens || []).forEach(item => {
            const produto = (pedidoBanco.produtos || []).find(p => String(p.id) === String(item.produtoId));
            if (produto) alterarEstoqueProdutoPedido(produto, Number(item.quantidade || 0));
        });
    }

    // Remove movimentações exclusivas do pedido para não deixar histórico órfão.
    if (Array.isArray(pedidoBanco.estoqueMovimentacoes)) {
        pedidoBanco.estoqueMovimentacoes = pedidoBanco.estoqueMovimentacoes.filter(m => String(m.pedidoId) !== String(pedido.id));
    }

    pedidoBanco.pedidos.splice(indice, 1);
    salvarBanco(pedidoBanco);

    if (Number(pedidoDetalheAtualId) === Number(id)) {
        fecharDetalhePedido();
    }

    renderizarPedidos();
    AppPopup.alert(`Pedido #${numero} excluído com sucesso.`);
}
function formatarPrazoPedido(prazo){if(!prazo)return"—";const[a,m,d]=String(prazo).split("-");return a&&m&&d?`${d}/${m}/${a}`:prazo;}
function totalPedido(p){
    if (Number.isFinite(Number(p?.valor))) return Number(p.valor||0);
    return (p?.itens||[]).reduce((t,i)=>t+Number(i.total||Number(i.preco||0)*Number(i.quantidade||0)),0)+Number(p?.valorAdicional||0);
}
function consultarPedido(id) {
    pedidoBanco=obterBanco(); const p=(pedidoBanco.pedidos||[]).find(x=>Number(x.id)===Number(id)); if(!p){AppPopup.alert("Pedido não encontrado.");return;}
    pedidoDetalheAtualId=p.id; const num=String(p.numero||0).padStart(4,"0");
    document.getElementById("detalhePedidoNumero").textContent=`Pedido #${num}`;
    document.getElementById("detalhePedidoTitulo").textContent=p.titulo||"Pedido";
    document.getElementById("detalhePedidoCliente").textContent=p.cliente||"Consumidor não identificado";
    document.getElementById("detalhePedidoStatus").textContent=rotuloStatusPedido(p.status);
    document.getElementById("detalhePedidoPrazo").textContent=formatarPrazoPedido(p.prazo);
    document.getElementById("detalhePedidoTotal").textContent=formatarMoeda(totalPedido(p));
    document.getElementById("detalhePedidoDescricao").textContent=p.descricao||"Nenhuma observação.";
    const itens=Array.isArray(p.itens)?p.itens:[]; const qtd=itens.reduce((t,i)=>t+Number(i.quantidade||0),0);
    document.getElementById("detalhePedidoQuantidadeItens").textContent=`${qtd} ${qtd===1?"item":"itens"}`;
    const tbody=document.getElementById("detalhePedidoItens");
    tbody.innerHTML=itens.length?itens.map(i=>`<tr><td><strong>${pedidoEscape(i.nome||"Produto")}</strong></td><td>${Number(i.quantidade||0)}</td><td>${formatarMoeda(i.preco||0)}</td><td><strong>${formatarMoeda(i.total||Number(i.preco||0)*Number(i.quantidade||0))}</strong></td></tr>`).join(""):'<tr><td colspan="4" class="orders-empty">Pedido sem produtos cadastrados.</td></tr>';
    const extra=Number(p.valorAdicional ?? ((!itens.length)?p.valor:0) ?? 0); document.getElementById("detalhePedidoExtra").textContent=formatarMoeda(extra); document.getElementById("detalhePedidoExtraWrap").style.display=extra>0?"flex":"none";
    const btnImp=document.getElementById("btnImprimirPedidoDetalhe"); if(btnImp) btnImp.onclick=()=>imprimirPedido(p.id);
    const btnVenda=document.getElementById("btnImportarPedidoDetalhe"); if(btnVenda){ btnVenda.style.display=p.status==='cancelado'||p.vendaId?'none':'inline-flex'; btnVenda.onclick=()=>importarPedidoParaVenda(p.id); }
    const btnExcluir=document.getElementById("btnExcluirPedidoDetalhe"); if(btnExcluir){ btnExcluir.onclick=()=>excluirPedido(p.id); }
    const modal=document.getElementById("modalDetalhePedido"); modal.classList.add("active"); modal.setAttribute("aria-hidden","false");
}
function fecharDetalhePedido(){const m=document.getElementById("modalDetalhePedido");if(m){m.classList.remove("active");m.setAttribute("aria-hidden","true");}pedidoDetalheAtualId=null;}
function importarPedidoParaVenda(id){
    pedidoBanco=obterBanco(); const p=(pedidoBanco.pedidos||[]).find(x=>Number(x.id)===Number(id)); if(!p)return;
    if(p.status==='cancelado'){AppPopup.alert("Pedidos cancelados não podem ser importados para venda.");return;}
    if(p.vendaId){AppPopup.alert("Este pedido já foi convertido em venda.");return;}
    window.location.href=`vendas.html?pedido=${encodeURIComponent(p.id)}`;
}
function imprimirPedido(id){
    pedidoBanco=obterBanco();const p=(pedidoBanco.pedidos||[]).find(x=>Number(x.id)===Number(id));if(!p){AppPopup.alert("Pedido não encontrado.");return;}
    const cfg=pedidoBanco.configuracoes?.empresa||{};const itens=Array.isArray(p.itens)?p.itens:[];const extra=Number(p.valorAdicional ?? ((!itens.length)?p.valor:0) ?? 0);
    const w=window.open("","_blank","width=700,height=800");if(!w){AppPopup.alert("Permita pop-ups para imprimir o pedido.");return;}
    const rows=itens.length?itens.map(i=>`<tr><td>${pedidoEscape(i.nome||"Produto")}</td><td>${Number(i.quantidade||0)}</td><td>${formatarMoeda(i.preco||0)}</td><td>${formatarMoeda(i.total||Number(i.preco||0)*Number(i.quantidade||0))}</td></tr>`).join(""):'<tr><td colspan="4">Sem produtos cadastrados</td></tr>';
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Pedido #${String(p.numero||0).padStart(4,"0")}</title><style>body{font-family:Arial,sans-serif;color:#172033;margin:32px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:16px}.brand h1{margin:0;font-size:22px}.tag{font-weight:700;color:#2563eb}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.box{border:1px solid #dbe3ee;border-radius:8px;padding:10px}.box span{display:block;font-size:10px;color:#64748b;text-transform:uppercase}.box strong{font-size:13px}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{padding:9px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:12px}th{background:#f8fafc}.obs{margin-top:18px;padding:12px;background:#f8fafc;border-radius:8px;font-size:12px}.total{margin:20px 0 0 auto;width:280px;font-size:14px}.total div{display:flex;justify-content:space-between;padding:6px 0}.grand{border-top:1px solid #cbd5e1;font-size:18px;font-weight:700;color:#2563eb}.foot{text-align:center;margin-top:30px;font-size:10px;color:#64748b}@media print{body{margin:12mm}.no-print{display:none}}</style></head><body><div class="head"><div class="brand"><h1>${pedidoEscape(cfg.nome||"Marcelino Bordados")}</h1><div>Pedido / ordem de produção</div></div><div class="tag">PEDIDO #${String(p.numero||0).padStart(4,"0")}</div></div><div class="grid"><div class="box"><span>Cliente</span><strong>${pedidoEscape(p.cliente||"Consumidor não identificado")}</strong></div><div class="box"><span>Status</span><strong>${rotuloStatusPedido(p.status)}</strong></div><div class="box"><span>Data</span><strong>${formatarData(p.criadoEm)}</strong></div><div class="box"><span>Prazo</span><strong>${pedidoEscape(formatarPrazoPedido(p.prazo))}</strong></div></div><strong>${pedidoEscape(p.titulo||"Pedido")}</strong>${p.descricao?`<div class="obs">${pedidoEscape(p.descricao)}</div>`:""}<table><thead><tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total">${extra>0?`<div><span>Valor adicional</span><strong>${formatarMoeda(extra)}</strong></div>`:""}<div class="grand"><span>Total</span><strong>${formatarMoeda(totalPedido(p))}</strong></div></div><div class="foot">${pedidoEscape(cfg.telefone||"")} ${cfg.email?" • "+pedidoEscape(cfg.email):""}</div><script>window.onload=()=>{window.print();}<\/script></body></html>`);w.document.close();
}
function renderizarPedidos(){
    pedidoBanco=obterBanco();const pedidos=Array.isArray(pedidoBanco.pedidos)?pedidoBanco.pedidos:[];const termo=String(document.getElementById("buscarPedido")?.value||"").toLowerCase().trim();const filtro=document.getElementById("filtroStatusPedido")?.value||"";
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};set("pedidosTotal",pedidos.length);set("pedidosProducao",pedidos.filter(p=>p.status==="producao").length);set("pedidosConcluidos",pedidos.filter(p=>p.status==="concluido").length);set("pedidosCancelados",pedidos.filter(p=>p.status==="cancelado").length);
    const lista=[...pedidos].sort((a,b)=>new Date(b.criadoEm||0)-new Date(a.criadoEm||0)).filter(p=>{const texto=`${p.numero||""} ${p.cliente||""} ${p.titulo||""} ${p.descricao||""}`.toLowerCase();return(!termo||texto.includes(termo))&&(!filtro||p.status===filtro);});
    const tbody=document.getElementById("listaPedidos");if(!tbody)return;if(!lista.length){tbody.innerHTML='<tr><td colspan="7" class="orders-empty">Nenhum pedido encontrado.</td></tr>';return;}
    tbody.innerHTML=lista.map(p=>{const numero=String(p.numero||0).padStart(4,"0"),status=p.status||"producao",qtd=(p.itens||[]).reduce((t,i)=>t+Number(i.quantidade||0),0);return `<tr class="order-row ${status}"><td data-label="Pedido"><strong>#${numero}</strong><small>${formatarData(p.criadoEm)}</small></td><td data-label="Cliente"><strong>${pedidoEscape(p.cliente||"Consumidor não identificado")}</strong></td><td data-label="Descrição"><strong>${pedidoEscape(p.titulo||"Pedido")}</strong><small>${qtd?`${qtd} ${qtd===1?'item':'itens'}`:(p.descricao?pedidoEscape(p.descricao):'Sem itens')}</small></td><td data-label="Prazo">${pedidoEscape(formatarPrazoPedido(p.prazo))}</td><td data-label="Valor"><strong>${formatarMoeda(totalPedido(p))}</strong></td><td data-label="Status"><span class="order-status ${status}">${rotuloStatusPedido(status)}</span>${p.vendaId?'<small class="order-sale-linked">Venda gerada</small>':''}</td><td data-label="Ações"><div class="order-actions order-actions-rich"><div class="order-action-buttons"><button type="button" class="order-action view" onclick="consultarPedido(${Number(p.id)})" title="Consultar pedido"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg><span>Ver</span></button><button type="button" class="order-action print" onclick="imprimirPedido(${Number(p.id)})" title="Imprimir pedido"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg><span>Imprimir</span></button>${status!=='cancelado'&&!p.vendaId?`<button type="button" class="order-action sale" onclick="importarPedidoParaVenda(${Number(p.id)})" title="Enviar para venda"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1"></circle><circle cx="19" cy="20" r="1"></circle><path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H7"></path></svg><span>Venda</span></button>`:''}<button type="button" class="order-action delete" onclick="excluirPedido(${Number(p.id)})" title="Excluir pedido"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg><span>Excluir</span></button></div><select class="order-status-select" onchange="alterarStatusPedido(${Number(p.id)},this.value)"><option value="producao" ${status==='producao'?'selected':''}>Em produção</option><option value="concluido" ${status==='concluido'?'selected':''}>Concluído</option><option value="cancelado" ${status==='cancelado'?'selected':''}>Cancelado</option></select></div></td></tr>`;}).join("");
}
document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("formPedido")?.addEventListener("submit",salvarPedido);
    document.getElementById("buscarPedido")?.addEventListener("input",renderizarPedidos);
    document.getElementById("filtroStatusPedido")?.addEventListener("change",renderizarPedidos);
    document.getElementById("pedidoValor")?.addEventListener("input",renderizarItensNovoPedido);
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){fecharModalPedido();fecharDetalhePedido();}});
    renderizarPedidos();
    try {
        const verId = new URLSearchParams(window.location.search).get("ver");
        if (verId) setTimeout(() => consultarPedido(Number(verId)), 60);
    } catch (e) {}
});
