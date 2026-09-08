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
    if (!campo || !botao) return;

    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    atualizarIconeSenha(botao, mostrar);
    campo.focus({ preventScroll: true });
}

function atualizarIconeSenha(botao, senhaVisivel) {
    botao.setAttribute("aria-label", senhaVisivel ? "Ocultar senha" : "Mostrar senha");
    botao.setAttribute("title", senhaVisivel ? "Ocultar senha" : "Mostrar senha");
    botao.setAttribute("aria-pressed", senhaVisivel ? "true" : "false");

    botao.innerHTML = senhaVisivel
        ? `<svg class="password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <path d="M3 3l18 18"></path>
               <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
               <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2"></path>
               <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.1-.8"></path>
           </svg>`
        : `<svg class="password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path>
               <circle cx="12" cy="12" r="3"></circle>
           </svg>`;
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
