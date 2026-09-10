/*
==================================================
 ARTESANATO GESTÃO
 MÓDULO DE CLIENTES
==================================================
*/


/*
==================================================
 ABRIR MODAL
==================================================
*/

function abrirModalCliente(id = null) {

    const modal =
        document.getElementById(
            "modalCliente"
        );

    const form =
        document.getElementById(
            "formCliente"
        );


    form.reset();


    document.getElementById(
        "clienteId"
    ).value = "";


    document.getElementById(
        "tituloModalCliente"
    ).textContent =
        "Novo cliente";


    /*
    ==============================
    EDITAR
    ==============================
    */

    if (id !== null) {

        const banco =
            obterBanco();


        const cliente =
            banco.clientes.find(
                item => item.id === id
            );


        if (!cliente) {

            AppPopup.alert(
                "Cliente não encontrado."
            );

            return;

        }


        document.getElementById(
            "tituloModalCliente"
        ).textContent =
            "Editar cliente";


        document.getElementById(
            "clienteId"
        ).value =
            cliente.id;


        document.getElementById(
            "clienteNome"
        ).value =
            cliente.nome || "";


        document.getElementById(
            "clienteDocumento"
        ).value =
            cliente.documento || "";


        document.getElementById(
            "clienteTelefone"
        ).value =
            cliente.telefone || "";


        document.getElementById(
            "clienteEmail"
        ).value =
            cliente.email || "";


        document.getElementById(
            "clienteCep"
        ).value =
            cliente.cep || "";


        document.getElementById(
            "clienteCidade"
        ).value =
            cliente.cidade || "";


        document.getElementById(
            "clienteEndereco"
        ).value =
            cliente.endereco || "";


        document.getElementById(
            "clienteObservacoes"
        ).value =
            cliente.observacoes || "";

    }


    modal.classList.add(
        "active"
    );

}


/*
==================================================
 FECHAR MODAL
==================================================
*/

function fecharModalCliente() {

    document
        .getElementById(
            "modalCliente"
        )
        .classList.remove(
            "active"
        );

}


/*
==================================================
 SALVAR CLIENTE
==================================================
*/

function salvarCliente(event) {

    event.preventDefault();


    const banco =
        obterBanco();


    const id =
        document.getElementById(
            "clienteId"
        ).value;


    const nome =
        document.getElementById(
            "clienteNome"
        ).value.trim();


    const documento =
        document.getElementById(
            "clienteDocumento"
        ).value.trim();


    const telefone =
        document.getElementById(
            "clienteTelefone"
        ).value.trim();


    const email =
        document.getElementById(
            "clienteEmail"
        ).value.trim();


    const cep =
        document.getElementById(
            "clienteCep"
        ).value.trim();


    const cidade =
        document.getElementById(
            "clienteCidade"
        ).value.trim();


    const endereco =
        document.getElementById(
            "clienteEndereco"
        ).value.trim();


    const observacoes =
        document.getElementById(
            "clienteObservacoes"
        ).value.trim();


    /*
    ==============================
    VALIDAÇÃO
    ==============================
    */

    if (!nome) {

        AppPopup.alert(
            "Informe o nome do cliente."
        );

        return;

    }


    /*
    ==============================
    VERIFICAR DOCUMENTO
    ==============================
    */

    if (documento) {

        const documentoExistente =
            banco.clientes.find(
                cliente => {

                    return (
                        cliente.documento ===
                        documento &&

                        String(cliente.id) !==
                        String(id)
                    );

                }
            );


        if (documentoExistente) {

            AppPopup.alert(
                "Já existe um cliente cadastrado com este CPF/CNPJ."
            );

            return;

        }

    }


    /*
    ==============================
    NOVO CLIENTE
    ==============================
    */

    if (!id) {

        const novoCliente = {

            id: Date.now(),

            nome,

            documento,

            telefone,

            email,

            cep,

            cidade,

            endereco,

            observacoes,

            criadoEm:
                new Date().toISOString()

        };


        banco.clientes.push(
            novoCliente
        );


    } else {

        /*
        ==============================
        EDITAR
        ==============================
        */

        const indice =
            banco.clientes.findIndex(
                cliente =>
                    String(cliente.id) ===
                    String(id)
            );


        if (indice === -1) {

            AppPopup.alert(
                "Cliente não encontrado."
            );

            return;

        }


        banco.clientes[indice] = {

            ...banco.clientes[indice],

            nome,

            documento,

            telefone,

            email,

            cep,

            cidade,

            endereco,

            observacoes,

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


    fecharModalCliente();


    listarClientes();

    atualizarResumoClientes();


    AppPopup.alert(
        "Cliente salvo com sucesso!"
    );

}


/*
==================================================
 LISTAR CLIENTES
==================================================
*/

function listarClientes() {

    const banco =
        obterBanco();


    const tabela =
        document.getElementById(
            "listaClientes"
        );


    const campoBusca =
        document.getElementById(
            "buscarCliente"
        );


    const busca =
        (
            campoBusca?.value || ""
        )
        .toLowerCase()
        .trim();


    const clientes =
        banco.clientes.filter(
            cliente => {

                return (

                    cliente.nome
                        .toLowerCase()
                        .includes(busca)

                    ||

                    (cliente.documento || "")
                        .toLowerCase()
                        .includes(busca)

                    ||

                    (cliente.telefone || "")
                        .toLowerCase()
                        .includes(busca)

                    ||

                    (cliente.email || "")
                        .toLowerCase()
                        .includes(busca)

                );

            }
        );


    if (!clientes.length) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty"
                >
                    Nenhum cliente encontrado.
                </td>

            </tr>

        `;

        return;

    }


    tabela.innerHTML =
        clientes.map(
            cliente => {

                const estatisticas =
                    obterEstatisticasCliente(
                        cliente.id
                    );


                return `

                    <tr>

                        <td>

                            <strong>
                                ${cliente.nome}
                            </strong>

                        </td>


                        <td>
                            ${cliente.documento || "-"}
                        </td>


                        <td>
                            ${cliente.telefone || "-"}
                        </td>


                        <td>
                            ${cliente.email || "-"}
                        </td>


                        <td>
                            ${estatisticas.quantidade}
                        </td>


                        <td>

                            <strong>
                                ${formatarMoeda(
                                    estatisticas.total
                                )}
                            </strong>

                        </td>


                        <td>
                            ${formatarData(
                                cliente.criadoEm
                            )}
                        </td>


                        <td>

                            <div class="action-buttons">

                                <button
                                    class="action-button"
                                    title="Ver detalhes"
                                    onclick="abrirDetalhesCliente(${cliente.id})"
                                >
                                    👁️
                                </button>


                                <button
                                    class="action-button"
                                    title="Editar"
                                    onclick="abrirModalCliente(${cliente.id})"
                                >
                                    ✏️
                                </button>


                                <button
                                    class="action-button"
                                    title="Excluir"
                                    onclick="excluirCliente(${cliente.id})"
                                >
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/*
==================================================
 ESTATÍSTICAS DO CLIENTE
==================================================
*/

function obterEstatisticasCliente(
    clienteId
) {

    const banco =
        obterBanco();


    const vendas =
        banco.vendas.filter(
            venda => {

                return (
                    Number(venda.clienteId) ===
                    Number(clienteId)
                );

            }
        );


    const total =
        vendas.reduce(
            (
                soma,
                venda
            ) =>
                soma +
                Number(venda.total || 0),
            0
        );


    return {

        quantidade:
            vendas.length,

        total

    };

}


/*
==================================================
 RESUMO
==================================================
*/

function atualizarResumoClientes() {

    const banco =
        obterBanco();


    const clientes =
        banco.clientes;


    const totalClientes =
        clientes.length;


    const vendas =
        banco.vendas;


    const totalVendas =
        vendas.reduce(
            (
                soma,
                venda
            ) =>
                soma +
                Number(venda.total || 0),
            0
        );


    const quantidadeCompras =
        vendas.length;


    /*
    ==============================
    CLIENTE DESTAQUE
    ==============================
    */

    let clienteDestaque =
        null;


    let maiorValor =
        0;


    clientes.forEach(
        cliente => {

            const estatisticas =
                obterEstatisticasCliente(
                    cliente.id
                );


            if (
                estatisticas.total >
                maiorValor
            ) {

                maiorValor =
                    estatisticas.total;


                clienteDestaque =
                    cliente;

            }

        }
    );


    document.getElementById(
        "totalClientesPagina"
    ).textContent =
        totalClientes;


    document.getElementById(
        "totalVendasClientes"
    ).textContent =
        formatarMoeda(
            totalVendas
        );


    document.getElementById(
        "quantidadeComprasClientes"
    ).textContent =
        quantidadeCompras;


    document.getElementById(
        "clienteDestaque"
    ).textContent =
        clienteDestaque
            ? clienteDestaque.nome
            : "—";

}


/*
==================================================
 EXCLUIR CLIENTE
==================================================
*/

async function excluirCliente(id) {

    const banco =
        obterBanco();


    const cliente =
        banco.clientes.find(
            item => item.id === id
        );


    if (!cliente) {

        return;

    }


    /*
    ==============================
    VERIFICAR VENDAS
    ==============================
    */

    const possuiVendas =
        banco.vendas.some(
            venda =>
                Number(venda.clienteId) ===
                Number(id)
        );


    let mensagem =
        `Deseja excluir o cliente "${cliente.nome}"?`;


    if (possuiVendas) {

        mensagem +=
            "\n\nEste cliente possui vendas vinculadas. O histórico das vendas será mantido.";

    }


    const confirmar =
        await AppPopup.confirm(
            mensagem
        );


    if (!confirmar) {

        return;

    }


    banco.clientes =
        banco.clientes.filter(
            item =>
                item.id !== id
        );


    salvarBanco(banco);


    listarClientes();

    atualizarResumoClientes();

}


/*
==================================================
 DETALHES DO CLIENTE
==================================================
*/

function abrirDetalhesCliente(id) {

    const banco =
        obterBanco();


    const cliente =
        banco.clientes.find(
            item =>
                item.id === id
        );


    if (!cliente) {

        return;

    }


    const estatisticas =
        obterEstatisticasCliente(
            cliente.id
        );


    document.getElementById(
        "detalhesNome"
    ).textContent =
        cliente.nome;


    const vendas =
        banco.vendas
            .filter(
                venda =>
                    Number(venda.clienteId) ===
                    Number(cliente.id)
            )
            .sort(
                (a, b) =>
                    new Date(b.data) -
                    new Date(a.data)
            );


    let historicoHTML =
        "";


    if (!vendas.length) {

        historicoHTML = `

            <div class="purchase-empty">

                Nenhuma compra registrada.

            </div>

        `;

    } else {

        historicoHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Comanda
                            </th>

                            <th>
                                Data
                            </th>

                            <th>
                                Pagamento
                            </th>

                            <th>
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${
                            vendas.map(
                                venda => `

                                    <tr>

                                        <td>
                                            #${venda.comanda}
                                        </td>

                                        <td>
                                            ${formatarData(
                                                venda.data
                                            )}
                                        </td>

                                        <td>
                                            ${typeof formatarPagamentoVenda === "function" ? formatarPagamentoVenda(venda) : (venda.pagamento || "-")}
                                        </td>

                                        <td>
                                            <strong>
                                                ${formatarMoeda(
                                                    venda.total
                                                )}
                                            </strong>
                                        </td>

                                    </tr>

                                `
                            ).join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    }


    document.getElementById(
        "detalhesCliente"
    ).innerHTML = `

        <div class="customer-detail">

            <span>
                Telefone / WhatsApp
            </span>

            <strong>
                ${cliente.telefone || "-"}
            </strong>

        </div>


        <div class="customer-detail">

            <span>
                CPF/CNPJ
            </span>

            <strong>
                ${cliente.documento || "-"}
            </strong>

        </div>


        <div class="customer-detail">

            <span>
                E-mail
            </span>

            <strong>
                ${cliente.email || "-"}
            </strong>

        </div>


        <div class="customer-detail">

            <span>
                Cidade
            </span>

            <strong>
                ${cliente.cidade || "-"}
            </strong>

        </div>


        <div class="customer-detail full">

            <span>
                Endereço
            </span>

            <strong>
                ${cliente.endereco || "-"}
            </strong>

        </div>


        <div class="customer-detail full">

            <span>
                Total de compras
            </span>

            <strong>
                ${estatisticas.quantidade}
                ${
                    estatisticas.quantidade === 1
                        ? "compra"
                        : "compras"
                }
                —
                ${formatarMoeda(
                    estatisticas.total
                )}
            </strong>

        </div>


        <div class="customer-detail full">

            <span>
                Observações
            </span>

            <strong>
                ${cliente.observacoes || "Nenhuma observação."}
            </strong>

        </div>


        <div class="customer-purchases">

            <h4>
                Histórico de compras
            </h4>

            ${historicoHTML}

        </div>

    `;


    document
        .getElementById(
            "modalDetalhesCliente"
        )
        .classList.add(
            "active"
        );

}


/*
==================================================
 FECHAR DETALHES
==================================================
*/

function fecharDetalhesCliente() {

    document
        .getElementById(
            "modalDetalhesCliente"
        )
        .classList.remove(
            "active"
        );

}


/*
==================================================
 FECHAR MODAIS AO CLICAR FORA
==================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const modalCliente =
            document.getElementById(
                "modalCliente"
            );


        const modalDetalhes =
            document.getElementById(
                "modalDetalhesCliente"
            );


        modalCliente.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === this
                ) {

                    fecharModalCliente();

                }

            }
        );


        modalDetalhes.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === this
                ) {

                    fecharDetalhesCliente();

                }

            }
        );


        listarClientes();

        atualizarResumoClientes();

    }
);

/* ==================================================
   CONSULTA FINANCEIRA POR CLIENTE
================================================== */
function obterFinanceiroCliente(clienteId) {
    const banco=obterBanco();
    const vendas=(banco.vendas||[]).filter(v=>v.status!=='cancelada' && Number(v.clienteId)===Number(clienteId));
    const totalComprado=vendas.reduce((s,v)=>s+Number(v.total||0),0);
    const totalPago=vendas.reduce((s,v)=>s+obterFinanceiroVenda(v).valorPago,0);
    const totalPendente=vendas.reduce((s,v)=>s+obterFinanceiroVenda(v).valorPendente,0);
    return {vendas,totalComprado,totalPago,totalPendente};
}
function renderizarPesquisaFinanceiraClientes(){
    const input=document.getElementById('buscarFinanceiroCliente'); const area=document.getElementById('resultadoFinanceiroClientes'); if(!input||!area)return;
    const termo=input.value.trim().toLowerCase();
    if(!termo){area.innerHTML='<div class="customer-finance-empty">Digite o nome ou os dados do cliente para consultar a situação financeira.</div>';return;}
    const banco=obterBanco();
    const clientes=(banco.clientes||[]).filter(c=>`${c.nome||''} ${c.documento||''} ${c.telefone||''} ${c.email||''}`.toLowerCase().includes(termo));
    if(!clientes.length){area.innerHTML='<div class="customer-finance-empty">Nenhum cliente encontrado.</div>';return;}
    area.innerHTML=clientes.map(cliente=>{
        const f=obterFinanceiroCliente(cliente.id); const status=f.totalPendente>0?'Aguardando pagamento':'Em dia';
        const vendasPendentes=f.vendas.filter(v=>obterFinanceiroVenda(v).valorPendente>0);
        return `<article class="customer-finance-card"><div class="customer-finance-card-head"><div><strong>${escapeHtml(cliente.nome)}</strong><span>${escapeHtml(cliente.telefone||cliente.documento||cliente.email||'Cliente cadastrado')}</span></div><span class="customer-finance-status ${f.totalPendente>0?'waiting':'paid'}">${status}</span></div>
        <div class="customer-finance-values"><div><span>Total comprado</span><strong>${formatarMoeda(f.totalComprado)}</strong></div><div><span>Total pago</span><strong class="paid">${formatarMoeda(f.totalPago)}</strong></div><div><span>A receber</span><strong class="pending">${formatarMoeda(f.totalPendente)}</strong></div></div>
        <div class="customer-finance-pending-list">${vendasPendentes.length?`<strong>Vendas pendentes</strong>${vendasPendentes.map(v=>`<div><span>#${escapeHtml(v.comanda||String(v.id))} · ${formatarData(v.data)}</span><b>${formatarMoeda(obterFinanceiroVenda(v).valorPendente)}</b></div>`).join('')}`:'<span class="customer-all-paid">Nenhuma pendência de pagamento.</span>'}</div></article>`;
    }).join('');
}
document.addEventListener('DOMContentLoaded',()=>{ const input=document.getElementById('buscarFinanceiroCliente'); if(input) input.addEventListener('input',renderizarPesquisaFinanceiraClientes); });
