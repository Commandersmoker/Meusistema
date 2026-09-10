/* =========================================================
   MARCELINO BORDADOS — POPUPS MODERNOS
   Substitui alert()/confirm() nativos por diálogos do sistema.
   ========================================================= */
(function () {
    "use strict";

    const ICONS = {
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 8h.01"></path></svg>',
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16.5 8.5"></path></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.3 2.2 17.2A2 2 0 0 0 3.9 20h16.2a2 2 0 0 0 1.7-2.8L13.7 3.3a2 2 0 0 0-3.4 0Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
        danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>'
    };

    function ensureRoot() {
        let root = document.getElementById("appPopupRoot");
        if (!root) {
            root = document.createElement("div");
            root.id = "appPopupRoot";
            document.body.appendChild(root);
        }
        return root;
    }

    function normalizeText(value) {
        return String(value ?? "").replace(/\r/g, "").trim();
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function inferType(message, isConfirm) {
        const m = normalizeText(message).toLowerCase();
        if (/excluir|remover|não poderá ser desfeita|nao podera ser desfeita/.test(m)) return "danger";
        if (/atenção|atencao|cancelar|estoque insuficiente|não pode|nao pode|inválid|invalido|erro|falha/.test(m)) return "warning";
        if (/sucesso|salvo|registrad|restaurad|criado/.test(m) && !isConfirm) return "success";
        return "info";
    }

    function inferTitle(message, type, isConfirm) {
        const m = normalizeText(message);
        if (isConfirm) {
            if (/excluir/i.test(m)) return "Excluir registro?";
            if (/cancelar/i.test(m)) return "Confirmar cancelamento?";
            if (/finalizar/i.test(m)) return "Finalizar venda?";
            if (/restaurar/i.test(m)) return "Restaurar dados?";
            return "Confirmar ação";
        }
        if (type === "success") return "Tudo certo!";
        if (type === "danger") return "Atenção";
        if (type === "warning") return "Atenção";
        return "Informação";
    }

    function inferConfirmLabel(message) {
        const m = normalizeText(message);
        if (/excluir/i.test(m)) return "Excluir";
        if (/cancelar/i.test(m)) return "Confirmar cancelamento";
        if (/finalizar/i.test(m)) return "Finalizar venda";
        if (/restaurar/i.test(m)) return "Restaurar";
        return "Confirmar";
    }

    function buildMessageHtml(message) {
        const blocks = normalizeText(message).split(/\n\s*\n/).filter(Boolean);
        return blocks.map(block => {
            const lines = block.split("\n").filter(Boolean);
            const detailLines = lines.filter(line => /^.{1,28}:\s+/.test(line));
            if (detailLines.length === lines.length && lines.length > 0) {
                return '<div class="app-popup-details">' + lines.map(line => {
                    const idx = line.indexOf(":");
                    const key = line.slice(0, idx).trim();
                    const val = line.slice(idx + 1).trim();
                    return `<div class="app-popup-detail-row"><span>${escapeHtml(key)}</span><strong>${escapeHtml(val)}</strong></div>`;
                }).join("") + '</div>';
            }
            return `<p>${lines.map(escapeHtml).join("<br>")}</p>`;
        }).join("");
    }

    function show({ message, title, type, confirmText, cancelText, showCancel }) {
        return new Promise(resolve => {
            const root = ensureRoot();
            const resolvedType = type || inferType(message, showCancel);
            const resolvedTitle = title || inferTitle(message, resolvedType, showCancel);
            const primaryText = confirmText || (showCancel ? inferConfirmLabel(message) : "Entendi");

            root.innerHTML = `
                <div class="app-popup-backdrop" data-popup-dismiss="${showCancel ? "cancel" : "ok"}"></div>
                <section class="app-popup app-popup-${resolvedType}" role="dialog" aria-modal="true" aria-labelledby="appPopupTitle">
                    <button type="button" class="app-popup-close" aria-label="Fechar" data-popup-dismiss="${showCancel ? "cancel" : "ok"}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    </button>
                    <div class="app-popup-icon">${ICONS[resolvedType] || ICONS.info}</div>
                    <div class="app-popup-copy">
                        <span class="app-popup-eyebrow">Marcelino Bordados</span>
                        <h2 id="appPopupTitle">${escapeHtml(resolvedTitle)}</h2>
                        <div class="app-popup-message">${buildMessageHtml(message)}</div>
                    </div>
                    <div class="app-popup-actions">
                        ${showCancel ? `<button type="button" class="app-popup-btn app-popup-btn-secondary" data-popup-action="cancel">${escapeHtml(cancelText || "Cancelar")}</button>` : ""}
                        <button type="button" class="app-popup-btn app-popup-btn-primary" data-popup-action="confirm">${escapeHtml(primaryText)}</button>
                    </div>
                </section>`;

            root.classList.add("is-open");
            document.body.classList.add("app-popup-open");

            const primary = root.querySelector('[data-popup-action="confirm"]');
            const secondary = root.querySelector('[data-popup-action="cancel"]');
            const closeTargets = root.querySelectorAll("[data-popup-dismiss]");

            function finish(result) {
                document.removeEventListener("keydown", onKey);
                root.classList.remove("is-open");
                document.body.classList.remove("app-popup-open");
                setTimeout(() => { root.innerHTML = ""; }, 180);
                resolve(result);
            }

            function onKey(event) {
                if (event.key === "Escape") finish(showCancel ? false : true);
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    finish(true);
                }
            }

            primary?.addEventListener("click", () => finish(true), { once: true });
            secondary?.addEventListener("click", () => finish(false), { once: true });
            closeTargets.forEach(el => el.addEventListener("click", () => finish(showCancel ? false : true), { once: true }));
            document.addEventListener("keydown", onKey);
            setTimeout(() => primary?.focus(), 50);
        });
    }

    window.AppPopup = {
        alert(message, options = {}) {
            return show({ ...options, message, showCancel: false });
        },
        confirm(message, options = {}) {
            return show({ ...options, message, showCancel: true });
        },
        success(message, options = {}) {
            return show({ ...options, message, type: "success", showCancel: false });
        },
        warning(message, options = {}) {
            return show({ ...options, message, type: "warning", showCancel: false });
        },
        danger(message, options = {}) {
            return show({ ...options, message, type: "danger", showCancel: false });
        }
    };
})();
