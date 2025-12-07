import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCreateGame } from "../../../hooks/useGames";
import UserHeader from "../components/UserHeader";
export function UserCreateView({ me, onLogout, currentView, onNavigate }) {
    const [price, setPrice] = useState(1);
    const [autostartEnabled, setAutostartEnabled] = useState(true);
    const [autostartThreshold, setAutostartThreshold] = useState(10);
    const createGame = useCreateGame();
    const handleDecreasePrice = () => {
        if (price > 0.5)
            setPrice(p => Math.round((p - 0.5) * 10) / 10);
    };
    const handleIncreasePrice = () => {
        setPrice(p => Math.round((p + 0.5) * 10) / 10);
    };
    const handleCreate = () => {
        createGame.mutate({
            price,
            autostart_enabled: autostartEnabled,
            autostart_threshold: autostartEnabled ? autostartThreshold : undefined,
        }, {
            onSuccess: () => {
                onNavigate("join");
            }
        });
    };
    const estimatedPool = price * autostartThreshold * 0.9; // 10% comisión
    return (_jsxs("div", { className: "user-create-shell", children: [_jsx(UserHeader, { view: currentView, balance: me.balance, userEmail: me.email, onNavigate: onNavigate, onLogout: onLogout }), _jsx("main", { className: "user-create-main", children: _jsxs("div", { className: "user-create-content", children: [_jsxs("section", { className: "user-create-form", children: [_jsxs("header", { className: "user-create-heading", children: [_jsxs("div", { children: [_jsx("h2", { children: "Crear nueva partida" }), _jsx("p", { children: "Define precio, premios y condiciones de inicio." })] }), _jsxs("button", { type: "button", onClick: () => onNavigate("balance"), className: "user-create-back", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "arrow_back" }), "Volver"] })] }), _jsxs("div", { className: "user-create-cards", children: [_jsxs("article", { className: "user-create-card", children: [_jsx("h3", { children: "Precio por cart\u00F3n" }), _jsxs("div", { className: "user-create-price", children: [_jsx("button", { type: "button", onClick: handleDecreasePrice, "aria-label": "Disminuir precio", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "remove" }) }), _jsxs("div", { className: "user-create-price__input", children: [_jsx("input", { type: "number", min: 0.5, step: 0.5, value: price, onChange: (e) => setPrice(Math.max(0.5, parseFloat(e.target.value) || 0.5)), "aria-label": "Precio del cart\u00F3n" }), _jsx("span", { children: "cr\u00E9ditos" })] }), _jsx("button", { type: "button", onClick: handleIncreasePrice, "aria-label": "Incrementar precio", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "add" }) })] }), _jsx("p", { className: "user-create-note", children: "M\u00EDnimo 0.5 cr\u00E9ditos, en incrementos de 0.5." })] }), _jsxs("article", { className: "user-create-card", children: [_jsx("h3", { children: "Distribuci\u00F3n de premios" }), _jsx("div", { className: "user-create-prizes", children: _jsxs("div", { className: "user-create-prize user-create-prize--active", children: [_jsx("strong", { children: "3 Premios" }), _jsx("span", { children: "Diagonal 20% \u00B7 L\u00EDnea 20% \u00B7 Bingo 50%" })] }) }), _jsx("p", { className: "user-create-note", children: "La comisi\u00F3n de la plataforma es del 10%." })] }), _jsxs("article", { className: "user-create-card", children: [_jsx("h3", { children: "Inicio autom\u00E1tico" }), _jsx("div", { className: "user-create-autostart", children: _jsxs("div", { className: "user-create-autostart__row", children: [_jsxs("div", { children: [_jsx("p", { children: "M\u00EDnimo de cartones para iniciar" }), _jsx("span", { children: "La partida podr\u00E1 iniciarse al alcanzar este m\u00EDnimo." })] }), _jsxs("div", { className: "user-create-autostart__controls", children: [_jsx("input", { type: "number", min: 2, value: autostartThreshold, onChange: (e) => setAutostartThreshold(Math.max(2, parseInt(e.target.value) || 10)), "aria-label": "Cartones m\u00EDnimos para iniciar" }), _jsx("input", { type: "checkbox", checked: autostartEnabled, onChange: (e) => setAutostartEnabled(e.target.checked), "aria-label": "Activar inicio autom\u00E1tico" })] })] }) })] })] })] }), _jsxs("aside", { className: "user-create-summary", children: [_jsxs("article", { children: [_jsx("h3", { children: "Resumen de la partida" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("span", { children: "Precio / cart\u00F3n" }), _jsxs("strong", { children: [price, " cr\u00E9ditos"] })] }), _jsxs("li", { children: [_jsx("span", { children: "Premios" }), _jsxs("div", { children: [_jsx("strong", { children: "Diagonal: 20%" }), _jsx("strong", { children: "L\u00EDnea: 20%" }), _jsx("strong", { children: "Bingo: 50%" })] })] }), _jsxs("li", { children: [_jsx("span", { children: "M\u00EDnimo cartones" }), _jsx("strong", { children: autostartThreshold })] }), _jsxs("li", { children: [_jsx("span", { children: "Pozo estimado" }), _jsxs("strong", { children: [estimatedPool.toFixed(2), " cr\u00E9ditos"] })] })] })] }), _jsxs("div", { className: "user-create-actions", children: [_jsx("button", { type: "button", className: "user-create-actions__primary", onClick: handleCreate, disabled: createGame.isPending, children: createGame.isPending ? "Creando..." : "Crear partida" }), _jsx("button", { type: "button", className: "user-create-actions__secondary", onClick: () => onNavigate("balance"), children: "Cancelar" })] })] })] }) })] }));
}
export default UserCreateView;
