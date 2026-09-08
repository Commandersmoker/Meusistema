/* ==================================================
   MARCELINO BORDADOS — LOGIN ONLINE
   Supabase Auth
   ================================================== */

document.addEventListener("DOMContentLoaded", async function () {
    const formulario = document.getElementById("loginForm");
    const campoEmail = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");
    const botaoMostrarSenha = document.getElementById("mostrarSenha");

    if (botaoMostrarSenha) {
        botaoMostrarSenha.addEventListener("click", function () {
            const mostrar = campoSenha.type === "password";
            campoSenha.type = mostrar ? "text" : "password";
            botaoMostrarSenha.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
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
