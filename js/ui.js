/* ==================================================
   MARCELINO BORDADOS — UI COMPARTILHADA
   Sidebar, autenticação, usuário e ícones SVG.
   ================================================== */
(function () {
    const PUBLIC_PAGES = ["login.html", "cadastro.html"];

    const ICONS = {
        dashboard: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
        cart: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/>',
        package: '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v9"/><path d="M3 8v9l9 5 9-5V8"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        wallet: '<path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7"/><path d="M16 14h.01"/>',
        chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
        settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.36.4.7.7 1 .3.3.68.46 1.1.5H21v4h-.1a1.7 1.7 0 0 0-1.5.5Z"/>',
        logout: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/>',
        database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/>',
        bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
        menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        minus: '<path d="M5 12h14"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
        trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
        eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        arrows: '<path d="M7 7h11l-3-3"/><path d="m18 7-3 3"/><path d="M17 17H6l3 3"/><path d="m6 17 3-3"/>',
        printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
        refresh: '<path d="M20 11a8 8 0 1 0 2 5"/><path d="M20 4v7h-7"/>',
        alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
        star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1Z"/>',
        receipt: '<path d="M4 2v20l3-2 3 2 2-2 3 2 2-2 3 2V2l-3 2-3-2-2 2-3-2-2 2Z"/><path d="M16 8h-6M16 12h-6M14 16h-4"/>'
    };

    function svg(name, cls = "menu-icon") {
        const body = ICONS[name] || ICONS.dashboard;
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    }

    function currentPage() {
        const file = location.pathname.split("/").pop().toLowerCase();
        return file || "index.html";
    }

    async function protectPage() {
        const page = currentPage();
        if (PUBLIC_PAGES.includes(page)) return true;

        if (window.MarcelinoOnline && typeof window.MarcelinoOnline.verifyAccess === "function") {
            const ok = await window.MarcelinoOnline.verifyAccess();
            if (!ok) {
                location.replace("login.html");
                return false;
            }
            return true;
        }

        location.replace("login.html");
        return false;
    }

    function sidebarTemplate() {
        const page = currentPage();
        const menu = [
            ["index.html", "dashboard", "Dashboard"],
            ["vendas.html", "cart", "Vendas"],
            ["produtos.html", "package", "Produtos"],
            ["clientes.html", "users", "Clientes"],
            ["caixa.html", "wallet", "Caixa"],
            ["relatorios.html", "chart", "Relatórios"],
            ["configuracoes.html", "settings", "Configurações"],
            ["backup.html", "database", "Backup"]
        ];
        const links = menu.map(([href, icon, label]) => `<a href="${href}" class="menu-item ${page === href ? "active" : ""}">${svg(icon)}<span>${label}</span></a>`).join("");
        return `
            <div class="logo">
                <div class="logo-icon">M</div>
                <div><strong>Marcelino</strong><span>Bordados</span></div>
            </div>
            <nav class="menu">${links}</nav>
            <div class="sidebar-bottom">
                <a href="#" class="menu-item logout" data-action="logout">${svg("logout")}<span>Sair</span></a>
                <div class="system-version">Versão 1.8.0 Online</div>
            </div>`;
    }

    function mountSidebar() {
        const sidebar = document.querySelector(".sidebar");
        if (!sidebar) return;
        sidebar.innerHTML = sidebarTemplate();
        const logout = sidebar.querySelector('[data-action="logout"]');
        if (logout) logout.addEventListener("click", async function (event) {
            event.preventDefault();
            logout.style.pointerEvents = "none";
            try {
                if (window.MarcelinoOnline) await window.MarcelinoOnline.logout();
            } catch (erro) {
                console.warn("Falha ao encerrar sessão remota:", erro);
            } finally {
                ["usuarioLogado", "usuarioId", "usuarioNome", "usuarioLogin", "usuarioEmail"].forEach(k => sessionStorage.removeItem(k));
                location.replace("login.html");
            }
        });
    }

    function mountUserHeader() {
        const header = document.querySelector(".topbar, .page-header");
        if (!header) return;
        const existing = header.querySelector(".user-area");
        const name = sessionStorage.getItem("usuarioNome") || "Usuário";
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase() || "M";
        const html = `<div class="app-user-area"><div class="notification" title="Notificações">${svg("bell", "menu-icon")}</div><div class="app-user"><div class="user-avatar">${initials}</div><div><strong>${escapeHtml(name)}</strong><span>Administrador</span></div></div></div>`;
        if (existing) existing.outerHTML = html;
        else if (!header.querySelector(".app-user-area")) header.insertAdjacentHTML("beforeend", html);
        const oldUser = document.getElementById("nomeUsuarioLogado");
        if (oldUser) oldUser.textContent = name;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
    }

    function modernizeIcons(root = document) {
        const classMap = [
            [".stat-icon.stock, .summary-icon.stock", "package"],
            [".stat-icon.revenue, .summary-icon.revenue", "wallet"],
            [".stat-icon.sales, .summary-icon.sales", "chart"],
            [".stat-icon.clients, .summary-icon.clients", "users"],
            [".entrada-icon", "chart"], [".saida-icon", "chart"], [".saldo-icon", "wallet"], [".venda-icon", "cart"],
            [".report-purple", "cart"], [".report-blue", "receipt"], [".report-green", "wallet"], [".report-yellow", "package"]
        ];
        classMap.forEach(([selector, icon]) => root.querySelectorAll(selector).forEach(el => { if (!el.querySelector("svg")) el.innerHTML = svg(icon, "menu-icon"); }));

        root.querySelectorAll(".stat-icon, .summary-icon, .report-icon").forEach((el, index) => {
            if (!el.querySelector("svg")) {
                const icons = ["cart", "wallet", "package", "users"];
                el.innerHTML = svg(icons[index % icons.length], "menu-icon");
            }
        });
        root.querySelectorAll(".backup-icon").forEach((el, i) => { el.innerHTML = svg(i ? "refresh" : "save", "menu-icon"); });

        root.querySelectorAll("button").forEach(button => {
            if (button.dataset.iconized) return;
            const t = button.textContent.trim();
            const map = [
                [/^✏|editar/i, "edit"], [/^🗑|excluir|remover/i, "trash"], [/^👁|visualizar|detalhes/i, "eye"], [/^↕|moviment/i, "arrows"],
                [/novo produto|novo cliente|entrada/i, "plus"], [/saída/i, "minus"], [/imprimir/i, "printer"], [/gerar relatório/i, "chart"], [/backup|exportar/i, "save"], [/restaurar|importar/i, "refresh"]
            ];
            const hit = map.find(([re]) => re.test(t));
            if (hit) {
                const pureEmoji = /^[^\p{L}\p{N}]*$/u.test(t);
                button.innerHTML = `${svg(hit[1], "menu-icon")}${pureEmoji ? "" : `<span>${escapeHtml(t.replace(/^[^\p{L}\p{N}]+/u, "").trim())}</span>`}`;
                button.dataset.iconized = "1";
            }
        });
    }



    function mountMobileNavigation() {
        const sidebar = document.querySelector('.sidebar');
        const header = document.querySelector('.topbar, .page-header');
        if (!sidebar || !header) return;

        let overlay = document.querySelector('.mobile-sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-sidebar-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }

        let button = header.querySelector('.mobile-menu-toggle');
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'mobile-menu-toggle';
            button.setAttribute('aria-label', 'Abrir menu');
            button.setAttribute('aria-expanded', 'false');
            button.innerHTML = svg('menu', 'menu-icon');
            header.insertBefore(button, header.firstChild);
        }

        function closeMenu() {
            document.body.classList.remove('mobile-menu-open');
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-label', 'Abrir menu');
        }

        function toggleMenu() {
            const open = document.body.classList.toggle('mobile-menu-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        }

        button.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);
        sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeMenu();
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    function cleanLegacyText() {
        document.querySelectorAll("footer, .page-footer").forEach(footer => {
            footer.innerHTML = '<span>Marcelino Bordados © 2026</span><span>Sistema online</span>';
        });
        document.querySelectorAll('input[placeholder]').forEach(input => {
            input.placeholder = input.placeholder.replace(/[🔎🔍]\s*/g, "");
        });
    }

    async function iniciarUI() {
        if (!(await protectPage())) return;

        const iniciar = function () {
            mountSidebar();
            mountUserHeader();
            mountMobileNavigation();
            modernizeIcons();
            cleanLegacyText();
            const observer = new MutationObserver(() => modernizeIcons());
            observer.observe(document.body, { childList: true, subtree: true });

            window.addEventListener("marcelino:data-synced", function (event) {
                if (!event.detail || event.detail.source !== "remote") return;
                const modalAberto = document.querySelector(".modal.show, .sale-detail-modal.show, .modal-overlay.show");
                if (!modalAberto && document.visibilityState === "visible") {
                    location.reload();
                }
            }, { once: true });

            window.addEventListener("marcelino:sync-error", function () {
                let toast = document.querySelector(".online-sync-toast");
                if (!toast) {
                    toast = document.createElement("div");
                    toast.className = "online-sync-toast";
                    document.body.appendChild(toast);
                }
                toast.textContent = "Sem conexão com o banco online. As alterações ficaram salvas neste dispositivo e serão reenviadas quando a conexão voltar.";
                setTimeout(() => toast.remove(), 7000);
            });
        };

        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, { once: true });
        else iniciar();
    }

    iniciarUI();
})();
