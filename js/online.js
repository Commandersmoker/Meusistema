/* ==================================================
   MARCELINO BORDADOS — SINCRONIZAÇÃO ONLINE
   GitHub Pages + Supabase Auth + PostgreSQL

   Estratégia de compatibilidade:
   - O sistema existente continua lendo de forma síncrona
     pelo banco local do usuário.
   - O Supabase é a fonte compartilhada entre dispositivos.
   - Cada salvamento local é enviado ao Supabase.
   - Ao entrar, o banco remoto é baixado antes do Dashboard.
   ================================================== */

(function () {
    "use strict";

    const LEGACY_DB_NAME = "artesanatoGestao";
    const PUBLIC_PAGES = ["login.html", "cadastro.html"];
    const SYNC_INTERVAL = 30000;

    let client = null;
    let currentUser = null;
    let initialSyncDone = false;
    let lastRemoteUpdatedAt = null;
    let saveQueue = Promise.resolve();
    let syncTimer = null;

    function currentPage() {
        return (location.pathname.split("/").pop() || "index.html").toLowerCase();
    }

    function isPublicPage() {
        return PUBLIC_PAGES.includes(currentPage());
    }

    function config() {
        return window.SUPABASE_CONFIG || {};
    }

    function isConfigured() {
        const c = config();
        return Boolean(
            c.url &&
            c.anonKey &&
            !String(c.url).includes("COLE_AQUI") &&
            !String(c.anonKey).includes("COLE_AQUI")
        );
    }

    function localKey(userId) {
        return `${LEGACY_DB_NAME}:${userId}`;
    }

    function dirtyKey(userId) {
        return `marcelinoDirty:${userId}`;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function sanitizeDatabase(data) {
        const copy = data && typeof data === "object" ? clone(data) : {};
        // Contas e senhas antigas nunca são enviadas para o banco compartilhado.
        copy.usuarios = [];
        return copy;
    }

    function getLocalDatabaseForUser(userId) {
        const own = localStorage.getItem(localKey(userId));
        if (own) {
            try { return JSON.parse(own); } catch (_) {}
        }

        // Migração automática da versão local antiga no PRIMEIRO login online.
        const legacy = localStorage.getItem(LEGACY_DB_NAME);
        if (legacy) {
            try { return JSON.parse(legacy); } catch (_) {}
        }
        return null;
    }

    function putLocalDatabaseForUser(userId, data) {
        const safe = sanitizeDatabase(data || {});
        localStorage.setItem(localKey(userId), JSON.stringify(safe));
        return safe;
    }

    function setSessionUi(user) {
        if (!user) return;
        const meta = user.user_metadata || {};
        const nome = meta.nome || meta.name || user.email || "Usuário";
        const usuario = meta.usuario || (user.email ? user.email.split("@")[0] : "usuario");
        sessionStorage.setItem("usuarioLogado", "true");
        sessionStorage.setItem("usuarioId", String(user.id));
        sessionStorage.setItem("usuarioNome", nome);
        sessionStorage.setItem("usuarioLogin", usuario);
        sessionStorage.setItem("usuarioEmail", user.email || "");
    }

    function clearSessionUi() {
        ["usuarioLogado", "usuarioId", "usuarioNome", "usuarioLogin", "usuarioEmail"]
            .forEach(k => sessionStorage.removeItem(k));
    }

    async function loadLibrary() {
        if (window.supabase && window.supabase.createClient) {
            return window.supabase;
        }
        try {
            return await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
        } catch (firstError) {
            console.warn("Falha no CDN principal do Supabase. Tentando alternativo.", firstError);
            return await import("https://esm.sh/@supabase/supabase-js@2");
        }
    }

    const readyPromise = (async function init() {
        if (!isConfigured()) {
            console.warn("Supabase ainda não configurado. Edite js/supabase-config.js.");
            return null;
        }

        const lib = await loadLibrary();
        const createClient = lib.createClient || (lib.default && lib.default.createClient);
        client = createClient(config().url, config().anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

        const { data } = await client.auth.getSession();
        currentUser = data && data.session ? data.session.user : null;
        if (currentUser) setSessionUi(currentUser);

        client.auth.onAuthStateChange((_event, session) => {
            currentUser = session ? session.user : null;
            if (currentUser) setSessionUi(currentUser);
            else clearSessionUi();
        });

        return client;
    })().catch(error => {
        console.error("Não foi possível iniciar o Supabase:", error);
        return null;
    });

    async function ready() {
        return readyPromise;
    }

    async function requireClient() {
        const c = await ready();
        if (!c) {
            throw new Error("Supabase não configurado. Abra js/supabase-config.js e informe a Project URL e a chave pública.");
        }
        return c;
    }

    async function getUser() {
        const c = await requireClient();
        if (currentUser) return currentUser;
        const { data, error } = await c.auth.getUser();
        if (error || !data.user) return null;
        currentUser = data.user;
        setSessionUi(currentUser);
        return currentUser;
    }

    async function fetchRemoteRow(userId) {
        const c = await requireClient();
        const { data, error } = await c
            .from("user_databases")
            .select("data, updated_at")
            .eq("user_id", userId)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async function uploadDatabase(userId, banco) {
        const c = await requireClient();
        const safe = sanitizeDatabase(banco);
        const now = new Date().toISOString();
        const { error } = await c.from("user_databases").upsert({
            user_id: userId,
            data: safe,
            updated_at: now
        }, { onConflict: "user_id" });
        if (error) throw error;
        lastRemoteUpdatedAt = now;
        return safe;
    }

    async function syncAfterLogin() {
        const user = await getUser();
        if (!user) throw new Error("Sessão não encontrada.");

        setSessionUi(user);
        const local = getLocalDatabaseForUser(user.id);
        const remote = await fetchRemoteRow(user.id);
        const localDirty = localStorage.getItem(dirtyKey(user.id)) === "1";

        if (localDirty && local) {
            // Alterações feitas offline têm prioridade no próximo reencontro
            // com a internet, evitando perdê-las ao baixar o servidor.
            putLocalDatabaseForUser(user.id, local);
            await uploadDatabase(user.id, local);
            localStorage.removeItem(dirtyKey(user.id));
        } else if (remote && remote.data) {
            putLocalDatabaseForUser(user.id, remote.data);
            lastRemoteUpdatedAt = remote.updated_at || null;
        } else {
            const seed = local || {
                produtos: [], clientes: [], vendas: [], caixa: [], usuarios: [],
                estoqueMovimentacoes: [], entradasCaixa: [], saidasCaixa: [],
                configuracoes: {
                    empresa: { nome: "Marcelino Bordados", telefone: "", email: "", endereco: "", documento: "" },
                    usuario: "Administrador", corPrincipal: "#2563eb"
                }
            };
            putLocalDatabaseForUser(user.id, seed);
            await uploadDatabase(user.id, seed);
        }

        initialSyncDone = true;
        sessionStorage.setItem("marcelinoOnlineSincronizado", "true");
        window.dispatchEvent(new CustomEvent("marcelino:online-ready", { detail: { user } }));
        startAutoSync();
        return true;
    }

    async function syncFromServer(options = {}) {
        const user = await getUser();
        if (!user) return false;

        if (localStorage.getItem(dirtyKey(user.id)) === "1") {
            const local = getLocalDatabaseForUser(user.id);
            if (local) {
                await uploadDatabase(user.id, local);
                localStorage.removeItem(dirtyKey(user.id));
                return false;
            }
        }

        const remote = await fetchRemoteRow(user.id);
        if (!remote || !remote.data) return false;

        const key = localKey(user.id);
        let local = null;
        try { local = JSON.parse(localStorage.getItem(key) || "null"); } catch (_) {}

        const remoteSafe = sanitizeDatabase(remote.data);
        const localSafe = sanitizeDatabase(local || {});
        const changed = JSON.stringify(remoteSafe) !== JSON.stringify(localSafe);

        if (changed) {
            localStorage.setItem(key, JSON.stringify(remoteSafe));
            lastRemoteUpdatedAt = remote.updated_at || null;
            window.dispatchEvent(new CustomEvent("marcelino:data-synced", {
                detail: { source: "remote", reloadSuggested: Boolean(options.reloadSuggested) }
            }));
        }
        return changed;
    }

    function startAutoSync() {
        if (syncTimer) return;
        syncTimer = setInterval(() => {
            if (document.visibilityState === "visible") {
                syncFromServer({ reloadSuggested: false }).catch(console.warn);
            }
        }, SYNC_INTERVAL);

        window.addEventListener("focus", () => {
            syncFromServer({ reloadSuggested: false }).catch(console.warn);
        });
    }

    async function saveRemote(banco) {
        if (!initialSyncDone) return false;
        const user = await getUser();
        if (!user) return false;
        const snapshot = sanitizeDatabase(banco);
        saveQueue = saveQueue
            .catch(() => {})
            .then(() => uploadDatabase(user.id, snapshot))
            .catch(error => {
                console.error("Erro ao sincronizar dados com Supabase:", error);
                window.dispatchEvent(new CustomEvent("marcelino:sync-error", { detail: { error } }));
            });
        await saveQueue;
        localStorage.removeItem(dirtyKey(user.id));
        return true;
    }

    async function login(email, password) {
        const c = await requireClient();
        const { data, error } = await c.auth.signInWithPassword({
            email: String(email || "").trim().toLowerCase(),
            password: String(password || "")
        });
        if (error) throw error;
        currentUser = data.user;
        setSessionUi(currentUser);
        await syncAfterLogin();
        return currentUser;
    }

    async function register({ email, password, nome, usuario }) {
        const c = await requireClient();
        const { data, error } = await c.auth.signUp({
            email: String(email || "").trim().toLowerCase(),
            password: String(password || ""),
            options: {
                data: {
                    nome: String(nome || "").trim(),
                    usuario: String(usuario || "").trim().toLowerCase()
                },
                emailRedirectTo: new URL("login.html", location.href).href
            }
        });
        if (error) throw error;

        currentUser = data.session ? data.session.user : null;
        if (currentUser) {
            setSessionUi(currentUser);
            await syncAfterLogin();
        }

        return {
            user: data.user,
            session: data.session,
            needsEmailConfirmation: !data.session
        };
    }

    async function logout() {
        try {
            const c = await ready();
            if (c) await c.auth.signOut();
        } finally {
            currentUser = null;
            initialSyncDone = false;
            clearSessionUi();
        }
    }

    async function verifyAccess() {
        if (isPublicPage()) return true;
        try {
            const user = await getUser();
            if (!user) return false;

            const precisavaBootstrap = sessionStorage.getItem("marcelinoOnlineSincronizado") !== "true";
            setSessionUi(user);
            if (!initialSyncDone) await syncAfterLogin();

            // Em uma nova aba o sessionStorage começa vazio. Como o restante do
            // sistema ainda usa APIs síncronas, recarregamos UMA vez depois de
            // baixar o banco remoto. Na segunda carga todos os scripts já leem
            // o cache correto daquele usuário desde a primeira linha.
            if (precisavaBootstrap && sessionStorage.getItem("marcelinoBootstrapReload") !== "done") {
                sessionStorage.setItem("marcelinoBootstrapReload", "done");
                location.reload();
                return false;
            }

            return true;
        } catch (error) {
            console.error("Falha ao verificar sessão:", error);
            return false;
        }
    }

    window.MarcelinoOnline = {
        isConfigured,
        ready,
        getUser,
        login,
        register,
        logout,
        verifyAccess,
        syncAfterLogin,
        syncFromServer,
        saveRemote,
        localKey,
        dirtyKey,
        legacyDbName: LEGACY_DB_NAME
    };
})();
