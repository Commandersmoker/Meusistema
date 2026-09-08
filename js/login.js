/* ==================================================
   MARCELINO BORDADOS — LOGIN ONLINE
   Supabase Auth
   ================================================== */

document.addEventListener("DOMContentLoaded", async function () {
    const formulario = document.getElementById("loginForm");
    const campoEmail = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");
    const botaoMostrarSenha = document.getElementById("mostrarSenha");

    if (botaoMostrarSenha && campoSenha) {
        botaoMostrarSenha.addEventListener("click", function () {
            const mostrar = campoSenha.type === "password";
            campoSenha.type = mostrar ? "text" : "password";
            atualizarIconeSenha(botaoMostrarSenha, mostrar);
            campoSenha.focus({ preventScroll: true });
        });
    }

    if (!window.MarcelinoOnline || !window.MarcelinoOnline.isConfigured()) {
        mostrarErro("Supabase ainda não foi configurado. Preencha js/supabase-config.js antes de publicar.");
        return;
    }

    try {
        const user = await window.MarcelinoOnline.getUser();
        if (user) {
            await window.MarcelinoOnline.syncAfterLogin();
            location.replace("index.html");
            return;
        }
    } catch (_) {
        // Sem sessão ativa: permanece na tela de login.
    }

    if (formulario) {
        formulario.addEventListener("submit", async function (evento) {
            evento.preventDefault();
            esconderErro();

            const email = campoEmail.value.trim().toLowerCase();
            const senha = campoSenha.value;
            if (!email || !senha) {
                mostrarErro("Preencha e-mail e senha.");
                return;
            }

            const botao = document.getElementById("btnEntrar");
            if (botao) {
                botao.disabled = true;
                botao.textContent = "Sincronizando...";
            }

            try {
                await window.MarcelinoOnline.login(email, senha);
                location.replace("index.html");
            } catch (erro) {
                console.error(erro);
                mostrarErro(traduzirErroLogin(erro));
                if (botao) {
                    botao.disabled = false;
                    botao.textContent = "Entrar";
                }
            }
        });
    }
});

function atualizarIconeSenha(botao, senhaVisivel) {
    if (!botao) return;

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

function traduzirErroLogin(erro) {
    const texto = String((erro && erro.message) || erro || "").toLowerCase();
    if (texto.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (texto.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
    if (texto.includes("failed to fetch") || texto.includes("network")) return "Não foi possível conectar ao servidor. Verifique sua internet.";
    if (texto.includes("supabase não configurado")) return "Supabase ainda não foi configurado.";
    return (erro && erro.message) ? erro.message : "Não foi possível entrar.";
}

function mostrarErro(mensagem) {
    const elemento = document.getElementById("mensagemErro");
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.add("show");
}

function esconderErro() {
    const elemento = document.getElementById("mensagemErro");
    if (!elemento) return;
    elemento.textContent = "";
    elemento.classList.remove("show");
}
