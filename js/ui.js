/* ==================================================
   MARCELINO BORDADOS — UI COMPARTILHADA
   Sidebar, autenticação, usuário e ícones SVG.
   ================================================== */
(function () {
    document.documentElement.classList.add("ui-preparing");
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
        receipt: '<path d="M4 2v20l3-2 3 2 2-2 3 2 2-2 3 2V2l-3 2-3-2-2 2-3-2-2 2Z"/><path d="M16 8h-6M16 12h-6M14 16h-4"/>',
        user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
        cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 15 3-3 3 3"/><path d="M12 12v7"/>',
        chevron: '<path d="m6 9 6 6 6-6"/>',
        check: '<path d="m20 6-11 11-5-5"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        orders: '<path d="M9 5h6"/><path d="M9 9h6"/><path d="M9 13h4"/><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="m15 17 2 2 4-4"/>'
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
            ["pedidos.html", "orders", "Pedidos"],
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
                <div class="system-version">Versão 3.1.0 Online</div>
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
        const previous = header.querySelector(".app-user-area");
        if (previous) previous.remove();

        const name = sessionStorage.getItem("usuarioNome") || "Usuário";
        const email = sessionStorage.getItem("usuarioEmail") || "";
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase() || "M";

        const notifications = collectNotifications();
        const readIds = getReadNotificationIds();
        const unreadNotifications = notifications.filter(item => !readIds.has(item.id));
        const count = unreadNotifications.length;

        const html = `
            <div class="app-user-area" data-account-menu-root>
                <button type="button" class="notification app-header-button" data-notification-toggle aria-label="Notificações" aria-expanded="false">
                    ${svg("bell", "menu-icon")}
                    ${count ? `<span class="notification-badge">${count > 9 ? "9+" : count}</span>` : ""}
                </button>

                <button type="button" class="app-user app-account-toggle" data-account-toggle aria-label="Abrir menu da conta" aria-expanded="false">
                    <div class="user-avatar">${escapeHtml(initials)}</div>
                    <div class="app-user-copy"><strong>${escapeHtml(name)}</strong><span>Administrador</span></div>
                    ${svg("chevron", "account-chevron")}
                </button>

                <div class="header-popover notification-popover" data-notification-popover aria-hidden="true">
                    <div class="popover-header">
                        <div><strong>Notificações</strong><span data-notification-summary>${notifications.length ? (count ? `${count} ${count === 1 ? "nova" : "novas"}` : "Tudo visto") : "Tudo em dia"}</span></div>
                    </div>
                    <div class="notification-list">
                        ${renderNotifications(notifications)}
                    </div>
                </div>

                <div class="header-popover account-popover" data-account-popover aria-hidden="true">
                    <div class="account-summary">
                        <div class="account-summary-avatar">${escapeHtml(initials)}</div>
                        <div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(email || "Administrador")}</span></div>
                    </div>
                    <div class="account-sync-row">
                        <span class="account-sync-icon">${svg("cloud", "menu-icon")}</span>
                        <div><strong data-sync-label>Sincronização ativa</strong><span data-sync-time>${escapeHtml(formatSyncTime())}</span></div>
                    </div>
                    <nav class="account-menu-links">
                        <button type="button" data-account-action="profile">${svg("user", "menu-icon")}<span>Meu perfil</span></button>
                        <button type="button" data-account-action="settings">${svg("settings", "menu-icon")}<span>Configurações</span></button>
                        <button type="button" data-account-action="backup">${svg("save", "menu-icon")}<span>Fazer backup agora</span></button>
                        <button type="button" class="account-logout" data-account-action="logout">${svg("logout", "menu-icon")}<span>Sair</span></button>
                    </nav>
                </div>
            </div>`;

        if (existing) existing.outerHTML = html;
        else header.insertAdjacentHTML("beforeend", html);

        const oldUser = document.getElementById("nomeUsuarioLogado");
        if (oldUser) oldUser.textContent = name;
        bindAccountHeader(header.querySelector("[data-account-menu-root]"));
    }

    function getNotificationStorageKey() {
        const userId = sessionStorage.getItem("usuarioId") || sessionStorage.getItem("usuarioEmail") || "local";
        return `marcelinoNotificationsRead:${userId}`;
    }

    function getReadNotificationIds() {
        try {
            const raw = localStorage.getItem(getNotificationStorageKey());
            const values = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(values) ? values.map(String) : []);
        } catch (_) {
            return new Set();
        }
    }

    function markNotificationsAsRead(items) {
        if (!Array.isArray(items) || !items.length) return;
        const read = getReadNotificationIds();
        items.forEach(item => { if (item && item.id) read.add(String(item.id)); });

        // Mantém somente IDs das notificações ainda relevantes + uma pequena margem histórica.
        const currentIds = new Set(collectNotifications().map(item => String(item.id)));
        const compact = [...read].filter(id => currentIds.has(id)).slice(-100);
        try { localStorage.setItem(getNotificationStorageKey(), JSON.stringify(compact)); } catch (_) {}
    }

    function clearNotificationBadge(root) {
        if (!root) return;
        const badge = root.querySelector(".notification-badge");
        if (badge) badge.remove();
        const summary = root.querySelector("[data-notification-summary]");
        const current = collectNotifications();
        if (summary) summary.textContent = current.length ? "Tudo visto" : "Tudo em dia";
    }

    function collectNotifications() {
        let banco;
        try { banco = typeof obterBanco === "function" ? obterBanco() : null; } catch (_) { banco = null; }
        if (!banco) return [];
        const items = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pendentes = (Array.isArray(banco.vendas) ? banco.vendas : []).filter(v => v && v.status !== "cancelada" && v.statusPagamento !== "paga" && Number(v.valorPendente || 0) > 0);
        if (pendentes.length) {
            const total = pendentes.reduce((sum, v) => sum + Number(v.valorPendente || 0), 0);
            items.push({ id: `pending:${pendentes.map(v => `${v.id || v.comanda || "x"}:${Number(v.valorPendente || 0).toFixed(2)}`).sort().join("|")}`, type: "warning", icon: "wallet", title: `${pendentes.length} ${pendentes.length === 1 ? "venda aguardando" : "vendas aguardando"} pagamento`, text: `Total pendente: ${formatCurrency(total)}`, href: "vendas.html" });
        }

        const lowStock = (Array.isArray(banco.produtos) ? banco.produtos : []).filter(p => Number(p.quantidade || 0) <= Number(p.estoqueMinimo || 0));
        if (lowStock.length) items.push({ id: `stock:${lowStock.map(p => `${p.id || p.codigo || p.nome || "x"}:${Number(p.quantidade || 0)}`).sort().join("|")}`, type: "danger", icon: "package", title: `${lowStock.length} ${lowStock.length === 1 ? "produto com" : "produtos com"} estoque baixo`, text: "Confira os itens que precisam de reposição.", href: "produtos.html" });

        const pedidos = (Array.isArray(banco.pedidos) ? banco.pedidos : []).filter(p => p && String(p.status || "").toLowerCase().includes("produção"));
        let atrasados = 0, proximos = 0;
        pedidos.forEach(p => {
            if (!p.prazo) return;
            const due = parseLocalDate(p.prazo);
            if (!due) return;
            const diff = Math.ceil((due - today) / 86400000);
            if (diff < 0) atrasados += 1;
            else if (diff <= 2) proximos += 1;
        });
        if (atrasados) items.push({ id: `orders-overdue:${pedidos.filter(p => { const d = p.prazo ? parseLocalDate(p.prazo) : null; return d && Math.ceil((d - today) / 86400000) < 0; }).map(p => `${p.id || p.numero || p.titulo || "x"}:${p.prazo || ""}`).sort().join("|")}`, type: "danger", icon: "alert", title: `${atrasados} ${atrasados === 1 ? "pedido atrasado" : "pedidos atrasados"}`, text: "Existem pedidos em produção com prazo vencido.", href: "pedidos.html" });
        if (proximos) items.push({ id: `orders-due:${pedidos.filter(p => { const d = p.prazo ? parseLocalDate(p.prazo) : null; if (!d) return false; const diff = Math.ceil((d - today) / 86400000); return diff >= 0 && diff <= 2; }).map(p => `${p.id || p.numero || p.titulo || "x"}:${p.prazo || ""}`).sort().join("|")}`, type: "warning", icon: "clock", title: `${proximos} ${proximos === 1 ? "pedido próximo" : "pedidos próximos"} do prazo`, text: "Prazo de entrega em até 2 dias.", href: "pedidos.html" });
        if (pedidos.length && !atrasados && !proximos) items.push({ id: `orders-active:${pedidos.map(p => `${p.id || p.numero || p.titulo || "x"}:${p.status || ""}:${p.prazo || ""}`).sort().join("|")}`, type: "info", icon: "orders", title: `${pedidos.length} ${pedidos.length === 1 ? "pedido em produção" : "pedidos em produção"}`, text: "Acompanhe o andamento dos pedidos ativos.", href: "pedidos.html" });
        return items;
    }

    function parseLocalDate(value) {
        if (!value) return null;
        const str = String(value);
        let d;
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [y,m,day] = str.split("-").map(Number); d = new Date(y,m-1,day);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [day,m,y] = str.split("/").map(Number); d = new Date(y,m-1,day);
        } else d = new Date(str);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function formatCurrency(value) {
        return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function renderNotifications(items) {
        if (!items.length) return `<div class="notification-empty">${svg("check", "notification-empty-icon")}<strong>Nenhuma pendência importante</strong><span>Estoque, recebimentos e pedidos estão em dia.</span></div>`;
        return items.map(item => `<a class="notification-item notification-${item.type}" href="${item.href}"><span class="notification-item-icon">${svg(item.icon, "menu-icon")}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></span></a>`).join("");
    }

    function formatSyncTime() {
        const raw = sessionStorage.getItem("marcelinoLastSyncAt");
        if (!raw) return navigator.onLine ? "Conectado ao banco online" : "Modo offline";
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return "Sincronização ativa";
        return `Última sincronização: ${date.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}`;
    }

    function bindAccountHeader(root) {
        if (!root) return;
        const accountButton = root.querySelector("[data-account-toggle]");
        const notificationButton = root.querySelector("[data-notification-toggle]");
        const account = root.querySelector("[data-account-popover]");
        const notifications = root.querySelector("[data-notification-popover]");

        function setOpen(panel, button, open) {
            panel.classList.toggle("is-open", open);
            panel.setAttribute("aria-hidden", open ? "false" : "true");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        }
        function closeAll() { setOpen(account, accountButton, false); setOpen(notifications, notificationButton, false); }
        accountButton.addEventListener("click", e => { e.stopPropagation(); const open = !account.classList.contains("is-open"); closeAll(); setOpen(account, accountButton, open); });
        notificationButton.addEventListener("click", e => {
            e.stopPropagation();
            const open = !notifications.classList.contains("is-open");
            closeAll();
            setOpen(notifications, notificationButton, open);
            if (open) {
                // Visualizar a central marca as notificações atuais como lidas.
                markNotificationsAsRead(collectNotifications());
                clearNotificationBadge(root);
            }
        });
        document.addEventListener("click", e => { if (!root.contains(e.target)) closeAll(); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

        root.querySelectorAll("[data-account-action]").forEach(button => button.addEventListener("click", async () => {
            const action = button.dataset.accountAction;
            closeAll();
            if (action === "settings") { location.href = "configuracoes.html"; return; }
            if (action === "profile") { showProfileDialog(); return; }
            if (action === "backup") { exportQuickBackup(); return; }
            if (action === "logout") { await logoutFromHeader(); }
        }));
    }

    function showProfileDialog() {
        const name = sessionStorage.getItem("usuarioNome") || "Usuário";
        const email = sessionStorage.getItem("usuarioEmail") || "Não informado";
        const login = sessionStorage.getItem("usuarioLogin") || "-";
        if (window.AppPopup && typeof AppPopup.alert === "function") {
            AppPopup.alert(`Perfil da conta\n\nNome: ${name}\nE-mail: ${email}\nUsuário: ${login}\nPerfil: Administrador`);
        } else {
            window.alert(`Perfil da conta\n\nNome: ${name}\nE-mail: ${email}\nUsuário: ${login}\nPerfil: Administrador`);
        }
    }

    function exportQuickBackup() {
        try {
            const banco = typeof obterBanco === "function" ? obterBanco() : {};
            const data = new Date();
            const stamp = data.toISOString().slice(0, 10);
            const blob = new Blob([JSON.stringify(banco, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `backup-marcelino-${stamp}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            localStorage.setItem("marcelinoLastBackupAt", data.toISOString());
            if (window.AppPopup && typeof AppPopup.alert === "function") AppPopup.alert("Backup criado com sucesso!");
        } catch (error) {
            console.error(error);
            if (window.AppPopup && typeof AppPopup.alert === "function") AppPopup.alert("Não foi possível criar o backup.");
        }
    }

    async function logoutFromHeader() {
        let allowed = true;
        if (window.AppPopup && typeof AppPopup.confirm === "function") allowed = await AppPopup.confirm("Deseja sair da sua conta?");
        if (!allowed) return;
        try { if (window.MarcelinoOnline) await window.MarcelinoOnline.logout(); } catch (error) { console.warn(error); }
        ["usuarioLogado", "usuarioId", "usuarioNome", "usuarioLogin", "usuarioEmail", "marcelinoOnlineSincronizado", "marcelinoBootstrapReload"].forEach(k => sessionStorage.removeItem(k));
        location.replace("login.html");
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

        // Garante apenas UM botão de menu no cabeçalho.
        // Algumas páginas antigas possuíam um botão próprio (.mobile-menu-button),
        // enquanto o ui.js também criava .mobile-menu-toggle, causando duplicidade.
        const legacyButtons = Array.from(header.querySelectorAll('.mobile-menu-button'));
        let button = header.querySelector('.mobile-menu-toggle');

        if (!button && legacyButtons.length) {
            button = legacyButtons.shift();
            button.classList.remove('mobile-menu-button');
            button.classList.add('mobile-menu-toggle');
            button.removeAttribute('id');
            button.innerHTML = svg('menu', 'menu-icon');
        }

        legacyButtons.forEach(item => item.remove());

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

    function refreshHeaderSyncStatus() {
        const label = document.querySelector("[data-sync-label]");
        const time = document.querySelector("[data-sync-time]");
        if (label) label.textContent = navigator.onLine ? "Sincronização ativa" : "Modo offline";
        if (time) time.textContent = formatSyncTime();
    }

    async function iniciarUI() {
        const prepararVisual = function () {
            mountSidebar();
            mountUserHeader();
            mountMobileNavigation();
            modernizeIcons();
            cleanLegacyText();

            // Libera a primeira pintura apenas depois de trocar todos os ícones
            // legados pelos SVGs modernos. Isso elimina o "piscar" de emojis/
            // ícones antigos durante a navegação entre páginas.
            // Como ui-preparing já está no <html> antes da primeira pintura,
            // podemos liberar assim que todos os elementos forem substituídos.
            document.documentElement.classList.remove("ui-preparing");
            document.documentElement.classList.add("ui-ready");
        };

        const iniciarRecursos = function () {
            const observer = new MutationObserver(() => modernizeIcons());
            observer.observe(document.body, { childList: true, subtree: true });

            function existeInteracaoEmAndamento() {
                const seletoresAbertos = [
                    ".modal.active", ".modal.show", ".modal.open",
                    ".modal-cash.active", ".modal-cash.show", ".modal-cash.open",
                    ".sale-detail-modal.active", ".sale-detail-modal.show", ".sale-detail-modal.open",
                    ".sale-record-modal.active", ".sale-record-modal.show", ".sale-record-modal.open",
                    ".payment-receipt-modal.active", ".payment-receipt-modal.show", ".payment-receipt-modal.open",
                    ".modal-overlay.active", ".modal-overlay.show", ".modal-overlay.open",
                    "[aria-modal=\"true\"]:not([aria-hidden=\"true\"])",
                    "[role=\"dialog\"]:not([aria-hidden=\"true\"])",
                    "[class*=\"modal\"][aria-hidden=\"false\"]"
                ];
                if (document.querySelector(seletoresAbertos.join(","))) return true;
                if (document.body.classList.contains("modal-open")) return true;
                const ativo = document.activeElement;
                if (ativo && ativo.closest && ativo.closest("form")) {
                    const tag = String(ativo.tagName || "").toLowerCase();
                    if (["input", "textarea", "select"].includes(tag)) return true;
                }
                return false;
            }

            window.addEventListener("marcelino:data-synced", function (event) {
                if (!event.detail || event.detail.source !== "remote") return;
                if (document.visibilityState !== "visible") return;
                if (existeInteracaoEmAndamento()) {
                    console.info("Sincronização recebida durante edição: recarregamento adiado para preservar o formulário.");
                    return;
                }
                location.reload();
            });

            window.addEventListener("marcelino:online-ready", function () {
                sessionStorage.setItem("marcelinoLastSyncAt", new Date().toISOString());
                refreshHeaderSyncStatus();
            });

            window.addEventListener("marcelino:data-synced", function () {
                sessionStorage.setItem("marcelinoLastSyncAt", new Date().toISOString());
                refreshHeaderSyncStatus();
            });

            window.addEventListener("online", refreshHeaderSyncStatus);
            window.addEventListener("offline", refreshHeaderSyncStatus);

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

        const boot = async function () {
            // A camada visual é montada antes da consulta remota de autenticação.
            // Assim a página nunca mostra os ícones HTML antigos enquanto espera a rede.
            prepararVisual();
            if (!(await protectPage())) return;
            // A autenticação online pode preencher nome/e-mail depois da primeira
            // montagem visual. Remonta o cabeçalho para mostrar os dados reais.
            mountUserHeader();
            iniciarRecursos();
        };

        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
        else boot();
    }

    iniciarUI();
})();
