/* =====================================================
   BACKUP DO SISTEMA
===================================================== */


/* =====================================================
   EXPORTAR
===================================================== */

function exportarBackup() {

    const banco = obterBanco();


    const dados = JSON.stringify(
        banco,
        null,
        4
    );


    const blob = new Blob(
        [dados],
        {
            type: "application/json"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    const data =
        new Date()
            .toISOString()
            .substring(0, 10);


    link.href = url;

    link.download =
        `backup-marcelino-${data}.json`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

    localStorage.setItem("marcelinoLastBackupAt", new Date().toISOString());

    AppPopup.alert(
        "Backup criado com sucesso!"
    );

}


/* =====================================================
   IMPORTAR
===================================================== */

async function importarBackup(event) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {
        return;
    }


    const confirmar =
        await AppPopup.confirm(
            "ATENÇÃO!\n\n" +
            "Restaurar este backup irá substituir " +
            "os dados atuais do sistema.\n\n" +
            "Deseja continuar?"
        );


    if (!confirmar) {

        event.target.value = "";

        return;

    }


    const leitor =
        new FileReader();


    leitor.onload = function(e) {

        try {

            const banco =
                JSON.parse(
                    e.target.result
                );


            if (
                !banco ||
                typeof banco !== "object"
            ) {

                throw new Error(
                    "Arquivo inválido"
                );

            }


            /*
             * Garante que as principais
             * estruturas existam.
             */

            banco.produtos =
                Array.isArray(banco.produtos)
                    ? banco.produtos
                    : [];


            banco.clientes =
                Array.isArray(banco.clientes)
                    ? banco.clientes
                    : [];


            banco.vendas =
                Array.isArray(banco.vendas)
                    ? banco.vendas
                    : [];


            banco.movimentacoes =
                Array.isArray(banco.movimentacoes)
                    ? banco.movimentacoes
                    : [];


            salvarBanco(banco);


            AppPopup.alert(
                "Backup restaurado com sucesso!"
            );


            location.reload();


        } catch (erro) {

            console.error(erro);

            AppPopup.alert(
                "Não foi possível restaurar o backup."
            );

        }

    };


    leitor.readAsText(arquivo);

}