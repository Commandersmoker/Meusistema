/* =====================================================
   IMPRESSÃO DE COMANDA
===================================================== */

function imprimirComanda(vendaId) {

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


    const produtos =
        Array.isArray(venda.produtos)
            ? venda.produtos
            : [];


    const janela =
        window.open(
            "",
            "_blank",
            "width=450,height=700"
        );


    if (!janela) {

        AppPopup.alert(
            "Permita pop-ups para imprimir a comanda."
        );

        return;

    }


    let produtosHTML = "";


    produtos.forEach(item => {

        const quantidade =
            Number(
                item.quantidade ||
                item.qtd ||
                0
            );


        const preco =
            Number(
                item.preco || 0
            );


        const total =
            Number(
                item.total ||
                preco * quantidade
            );


        produtosHTML += `

            <tr>

                <td>
                    ${item.nome || "Produto"}
                </td>

                <td>
                    ${quantidade}
                </td>

                <td>
                    ${formatarMoeda(total)}
                </td>

            </tr>

        `;

    });


    janela.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Comanda #${venda.comanda || venda.id}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    width: 360px;

                    margin: 0 auto;

                    padding: 20px;

                    color: #222;

                }

                .empresa {

                    text-align: center;

                    margin-bottom: 20px;

                }

                .empresa h1 {

                    margin: 0;

                    font-size: 21px;

                }

                .empresa p {

                    margin: 5px 0 0;

                    font-size: 12px;

                }

                .linha {

                    border-top:
                        1px dashed #999;

                    margin:
                        12px 0;

                }

                .info {

                    font-size: 12px;

                    line-height: 1.6;

                }

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 15px;

                }

                th {

                    text-align: left;

                    font-size: 11px;

                    border-bottom:
                        1px solid #222;

                    padding:
                        6px 0;

                }

                td {

                    font-size: 11px;

                    padding:
                        7px 0;

                    border-bottom:
                        1px solid #eee;

                }

                .totais {

                    margin-top: 15px;

                    font-size: 12px;

                }

                .total {

                    display: flex;

                    justify-content:
                        space-between;

                    margin-top: 8px;

                    font-size: 18px;

                    font-weight: bold;

                }

                .rodape {

                    text-align: center;

                    margin-top: 25px;

                    font-size: 10px;

                }

                @media print {

                    body {

                        width: 100%;

                    }

                }

            </style>

        </head>


        <body>


            <div class="empresa">

                <h1>
                    Marcelino Bordados
                </h1>

                <p>
                    Comprovante de venda
                </p>

            </div>


            <div class="linha"></div>


            <div class="info">

                <strong>
                    Comanda:
                </strong>

                #${venda.comanda || venda.id}

                <br>


                <strong>
                    Cliente:
                </strong>

                ${venda.cliente ||
                "Consumidor não identificado"}

                <br>


                <strong>
                    Data:
                </strong>

                ${
                    venda.data
                        ? formatarData(venda.data)
                        : "-"
                }

                <br>


                <strong>
                    Pagamento:
                </strong>

                ${typeof formatarPagamentoVenda === "function"
                    ? formatarPagamentoVenda(venda)
                    : (venda.pagamento === "Crédito"
                        ? ((Number(venda.parcelas || 1) > 1)
                            ? `Crédito - ${Number(venda.parcelas)}x de ${formatarMoeda(Number(venda.valorParcela || (Number(venda.total || 0) / Number(venda.parcelas || 1))))}`
                            : "Crédito - à vista")
                        : (venda.pagamento || "-"))}
                <br><strong>Status:</strong> ${venda.status === "cancelada" ? "CANCELADA" : ((venda.statusPagamento || "paga") === "paga" ? "PAGA" : "AGUARDANDO PAGAMENTO")}

            </div>


            <table>

                <thead>

                    <tr>

                        <th>
                            Produto
                        </th>

                        <th>
                            Qtd.
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${produtosHTML}

                </tbody>

            </table>


            <div class="totais">

                <div>

                    Subtotal:

                    ${formatarMoeda(
                        Number(
                            venda.subtotal || 0
                        )
                    )}

                </div>


                <div>

                    Desconto:

                    ${formatarMoeda(
                        Number(
                            venda.desconto || 0
                        )
                    )}

                </div>


                <div>Valor pago: ${formatarMoeda(Number(venda.valorPago ?? venda.total ?? 0))}</div>
                <div>Saldo pendente: ${formatarMoeda(Number(venda.valorPendente || 0))}</div>

                <div class="total">

                    <span>
                        TOTAL
                    </span>

                    <span>
                        ${formatarMoeda(
                            Number(
                                venda.total || 0
                            )
                        )}
                    </span>

                </div>

            </div>


            <div class="linha"></div>


            <div class="rodape">

                Obrigado pela preferência!

                <br>

                Marcelino Bordados

            </div>


        </body>

        </html>

    `);


    janela.document.close();


    janela.focus();


    setTimeout(() => {

        janela.print();

    }, 300);

}