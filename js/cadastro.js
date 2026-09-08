/* ==================================================
   MARCELINO BORDADOS — CADASTRO ONLINE
   Supabase Auth
   ================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("cadastroForm");
    const senha = document.getElementById("senha");
    const confirmarSenha = document.getElementById("confirmarSenha");
    const mostrarSenha = document.getElementById("mostrarSenha");
    const mostrarConfirmarSenha = document.getElementById("mostrarConfirmarSenha");

    if (mostrarSenha) mostrarSenha.addEventListener("click", () => alternarSenha(senha, mostrarSenha));
    if (mostrarConfirmarSenha) mostrarConfirmarSenha.addEventListener("click", () => alternarSenha(confirmarSenha, mostrarConfirmarSenha));
    if (formulario) formulario.addEventListener("submit", cadastrarUsuario);
});

async function cadastrarUsuario(evento) {
    evento.preventDefault();
    limparMensagens();

    if (!window.MarcelinoOnline || !window.MarcelinoOnline.isConfigured()) {
        mostrarErro("Supabase ainda não foi configurado. Preencha js/supabase-config.js.");
        return;
    }

    const nome = document.getElementById("nome").value.trim();
    const usuario = document.getElementById("usuario").value.trim().toLowerCase();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (nome.length < 3) return mostrarErro("Digite seu nome completo.");
    if (!/^[a-zA-Z0-9._-]+$/.test(usuario)) return mostrarErro("O usuário pode conter apenas letras, números, ponto, traço e underline.");
    if (usuario.length < 3) return mostrarErro("O usuário precisa ter pelo menos 3 caracteres.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return mostrarErro("Digite um e-mail válido.");
    if (senha.length < 6) return mostrarErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmarSenha) return mostrarErro("As senhas não são iguais.");

    const botao = document.getElementById("btnCadastrar");
    if (botao) {
        botao.disabled = true;
        botao.textContent = "Criando conta...";
    }

    try {
        const resultado = await window.MarcelinoOnline.register({ email, password: senha, nome, usuario });
        if (resultado.needsEmailConfirmation) {
            mostrarSucesso("Conta criada! Confirme o e-mail recebido e depois faça login.");
            if (botao) botao.textContent = "Conta criada";
            setTimeout(() => location.href = "login.html", 3500);
        } else {
            mostrarSucesso("Conta criada e sincronizada. Entrando...");
            setTimeout(() => location.replace("index.html"), 700);
        }
    } catch (erro) {
        console.error(erro);
        const texto = String((erro && erro.message) || erro || "");
        if (/already registered|already been registered|user already registered/i.test(texto)) {
            mostrarErro("Esse e-mail já possui uma conta.");
        } else if (/failed to fetch|network/i.test(texto)) {
            mostrarErro("Não foi possível conectar ao servidor. Verifique sua internet.");
        } else {
            mostrarErro(texto || "Não foi possível criar a conta.");
        }
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Criar minha conta";
        }
    }
}

function alternarSenha(campo, botao) {
    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
}

function mostrarErro(mensagem) {
    const elemento = document.getElementById("mensagemErro");
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.add("show");
}

function mostrarSucesso(mensagem) {
    const elemento = document.getElementById("mensagemSucesso");
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.add("show");
}

function limparMensagens() {
    ["mensagemErro", "mensagemSucesso"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ""; el.classList.remove("show"); }
    });
}
