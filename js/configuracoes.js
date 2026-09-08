/* ==================================================
   MARCELINO BORDADOS
   CONFIGURAÇÕES DO SISTEMA
   ================================================== */

document.addEventListener("DOMContentLoaded", function () {

    carregarConfiguracoes();

    const formulario =
        document.getElementById("formConfiguracoes");

    if (formulario) {

        formulario.addEventListener(
            "submit",
            salvarConfiguracoes
        );

    }

    const botaoBackup =
        document.getElementById("btnExportarBackup");

    if (botaoBackup) {

        botaoBackup.addEventListener(
            "click",
            function () {

                exportarBackup();

            }
        );

    }

    const inputBackup =
        document.getElementById("inputImportarBackup");

    if (inputBackup) {

        inputBackup.addEventListener(
            "change",
            function (evento) {

                const arquivo =
                    evento.target.files[0];

                if (!arquivo) {
                    return;
                }

                importarBackup(arquivo)
                    .then(function () {

                        alert(
                            "Backup restaurado com sucesso!"
                        );

                        location.reload();

                    })
                    .catch(function (erro) {

                        alert(
                            erro.message ||
                            "Não foi possível restaurar o backup."
                        );

                    });

            }
        );

    }

});


/* ==================================================
   CARREGAR CONFIGURAÇÕES
   ================================================== */

function carregarConfiguracoes() {

    const configuracoes =
        obterConfiguracoes();

    const empresa =
        configuracoes.empresa || {};


    preencherCampo(
        "nomeEmpresa",
        empresa.nome
    );

    preencherCampo(
        "telefoneEmpresa",
        empresa.telefone
    );

    preencherCampo(
        "emailEmpresa",
        empresa.email
    );

    preencherCampo(
        "documentoEmpresa",
        empresa.documento
    );

    preencherCampo(
        "enderecoEmpresa",
        empresa.endereco
    );

    preencherCampo(
        "usuarioSistema",
        configuracoes.usuario
    );


    const cor =
        document.getElementById(
            "corPrincipal"
        );

    if (cor) {

        cor.value =
            configuracoes.corPrincipal ||
            "#2563eb";

    }

}


/* ==================================================
   PREENCHER CAMPO
   ================================================== */

function preencherCampo(
    id,
    valor
) {

    const campo =
        document.getElementById(id);

    if (campo) {

        campo.value =
            valor || "";

    }

}


/* ==================================================
   SALVAR CONFIGURAÇÕES
   ================================================== */

function salvarConfiguracoes(
    evento
) {

    evento.preventDefault();


    const banco =
        obterBanco();


    if (!banco.configuracoes) {

        banco.configuracoes = {};

    }


    if (!banco.configuracoes.empresa) {

        banco.configuracoes.empresa = {};

    }


    const empresa =
        banco.configuracoes.empresa;


    const nome =
        obterValor(
            "nomeEmpresa"
        );

    const telefone =
        obterValor(
            "telefoneEmpresa"
        );

    const email =
        obterValor(
            "emailEmpresa"
        );

    const documento =
        obterValor(
            "documentoEmpresa"
        );

    const endereco =
        obterValor(
            "enderecoEmpresa"
        );

    const usuario =
        obterValor(
            "usuarioSistema"
        );

    const cor =
        obterValor(
            "corPrincipal"
        );


    empresa.nome =
        nome ||
        "Marcelino Bordados";

    empresa.telefone =
        telefone;

    empresa.email =
        email;

    empresa.documento =
        documento;

    empresa.endereco =
        endereco;


    banco.configuracoes.usuario =
        usuario ||
        "Administrador";


    banco.configuracoes.corPrincipal =
        cor ||
        "#2563eb";


    salvarBanco(banco);


    aplicarCorPrincipal(
        banco.configuracoes.corPrincipal
    );


    alert(
        "Configurações salvas com sucesso!"
    );

}


/* ==================================================
   OBTER VALOR DE CAMPO
   ================================================== */

function obterValor(id) {

    const campo =
        document.getElementById(id);

    if (!campo) {
        return "";
    }

    return campo.value.trim();

}


/* ==================================================
   APLICAR COR PRINCIPAL
   ================================================== */

function aplicarCorPrincipal(
    cor
) {

    if (!cor) {
        return;
    }


    document.documentElement.style
        .setProperty(
            "--primary",
            cor
        );

}


/* ==================================================
   RESETAR CONFIGURAÇÕES
   ================================================== */

function restaurarConfiguracoesPadrao() {

    const confirmar =
        confirm(
            "Deseja restaurar as configurações padrão?"
        );

    if (!confirmar) {
        return;
    }


    const banco =
        obterBanco();


    banco.configuracoes = {

        empresa: {

            nome:
                "Marcelino Bordados",

            telefone:
                "",

            email:
                "",

            endereco:
                "",

            documento:
                ""

        },

        usuario:
            "Administrador",

        corPrincipal:
            "#2563eb"

    };


    salvarBanco(banco);


    carregarConfiguracoes();


    aplicarCorPrincipal(
        "#2563eb"
    );


    alert(
        "Configurações restauradas!"
    );

}


/* ==================================================
   EXPORTAR BACKUP
   ================================================== */

function realizarBackup() {

    exportarBackup();

}


/* ==================================================
   IMPORTAR BACKUP
   ================================================== */

function restaurarBackup(
    arquivo
) {

    if (!arquivo) {

        alert(
            "Selecione um arquivo de backup."
        );

        return;

    }


    importarBackup(arquivo)
        .then(function () {

            alert(
                "Backup restaurado com sucesso!"
            );

            location.reload();

        })
        .catch(function (erro) {

            alert(
                erro.message ||
                "Arquivo de backup inválido."
            );

        });

}


/* ==================================================
   APLICAR CONFIGURAÇÕES AO CARREGAR
   ================================================== */

(function () {

    try {

        const configuracoes =
            obterConfiguracoes();

        if (
            configuracoes &&
            configuracoes.corPrincipal
        ) {

            aplicarCorPrincipal(
                configuracoes.corPrincipal
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar configurações:",
            erro
        );

    }

})();