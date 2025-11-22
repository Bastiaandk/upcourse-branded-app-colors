(function () {

    /* --------------------------------------------
    CSS (origineel, zonder slider zichtbaar in fase 1)
    -------------------------------------------- */
    function injectToggleCSS() {
        const css = `
        #jiffy_toggle_bar {
            width: 100%;
            padding: 5px 0;
            background: #111;
            opacity: 0;
            transition: opacity 0.4s ease;
        }

        #jiffy_toggle_inner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            width: 100%;
        }

        #jiffy_switch {
            position: relative;
            width: 60px;
            height: 30px;
            background: #111;
            border: 2px solid #444;
            border-radius: 20px;
            cursor: pointer;
            overflow: hidden;
        }

        /* slider pas zichtbaar na phase 2 */
        #jiffy_switch .slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            transition: transform 0.25s ease;
        }

        #jiffy_switch.active .slider {
            transform: translateX(28px);
        }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* --------------------------------------------
    HTML BAR — SLIDER EN ICON KOMEN LATER
    -------------------------------------------- */
    function injectToggleHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug 3 🎨</span>

                <div id="jiffy_switch" aria-role="switch"></div>

                <!-- Icoon pas in phase 2 -->
<span id="emoji_right" style="font-size:22px;">☾</span>
            </div>
        `;

        return bar;
    }

    /* --------------------------------------------
    snapshot + apply
    -------------------------------------------- */
    const SELECTOR_LIST =
        'div,section,article,header,footer,main,aside,' +
        'span,p,a,li,ul,ol,' +
        'h1,h2,h3,h4,h5,h6,' +
        'strong,em,b,i,small,blockquote,mark,' +
        'img,button,label,[style]';

    let elementsCache = [];
    const originalStyles = new WeakMap();
    const forcedStyles = new WeakMap();

    function snapshotStyles(targetMap) {
        elementsCache.forEach((el) => {
            const cs = getComputedStyle(el);
            targetMap.set(el, {
                color: cs.color,
                bg: cs.backgroundColor,
                inlineColor: el.style.color || null,
                inlineBg: el.style.backgroundColor || null,
            });
        });
    }

    function applySnapshot(snapshotMap) {
        elementsCache.forEach((el) => {

            // Skip the emoji icon → never apply snapshot to it
            if (el.id === "emoji_right") return;

            const saved = snapshotMap.get(el);
            if (!saved) return;

            el.style.setProperty(
                "color",
                saved.inlineColor !== null ? saved.inlineColor : saved.color,
                "important"
            );

            el.style.setProperty(
                "background-color",
                saved.inlineBg !== null ? saved.inlineBg : saved.bg,
                "important"
            );
        });
    }


    /* --------------------------------------------
    PHASE 1 — EARLY BAR (GEEN SLIDER, GEEN ICON)
    -------------------------------------------- */
    function initBarEarly() {
        injectToggleCSS();

        const bar = injectToggleHTML();
        const placeholder = document.getElementById("jiffy_bar_placeholder");

        if (placeholder) {
            placeholder.replaceWith(bar);
        } else {
            document.body.prepend(bar);
        }

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });

        return bar;
    }

    /* --------------------------------------------
    PHASE 2 — SLIDER + ICON NA DUMP TOEVOEGEN
    -------------------------------------------- */
    function activateSlider(bar) {

        const switchEl = bar.querySelector("#jiffy_switch");

        /* SLIDER AANMAKEN (Buiten Kajabi dump) */
        const slider = document.createElement("div");
        slider.className = "slider";

        slider.style.setProperty("background-color", "#444", "important");
        slider.style.setProperty("border", "1px solid #222", "important");
        slider.style.setProperty("visibility", "visible", "important");

        switchEl.appendChild(slider);

        /* forcedMode bepalen zoals origineel */
        const bodyStyles = getComputedStyle(document.body);
        const currentBg = bodyStyles.backgroundColor.trim();
        const forcedMode = currentBg.includes("16, 16, 16") ? "dark" : "light";

        /* SLIDER TINT */
        if (forcedMode === "light") {
            slider.style.setProperty("background-color", "#f9f9f9", "important");
            slider.style.setProperty("border-color", "#ccc", "important");
        }

        /* ICON (SUN/MOON) INZETTEN — NET ALS ORIGINEEL */
        const iconEl = bar.querySelector("#jiffy_icon");
        const emoji = forcedMode === "dark" ? "☾" : "𖤓";
        iconEl.textContent = emoji;

        // kleur hard vastzetten
        iconEl.style.setProperty("color", forcedMode === "dark" ? "#ddd" : "#fff", "important");

        /* ACTIVE MODE START (zoals origineel) */
        switchEl.classList.add("active");

        /* TOGGLE LOGICA (zoals origineel, zonder icon wissel) */
        switchEl.addEventListener("click", () => {
            switchEl.classList.toggle("active");

            const isOn = switchEl.classList.contains("active");

            if (isOn) {
                applySnapshot(forcedStyles);
            } else {
                applySnapshot(originalStyles);
            }
        });
    }

    /* --------------------------------------------
    INIT
    -------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {

        const bar = initBarEarly();

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        snapshotStyles(originalStyles);

        setTimeout(() => {

            snapshotStyles(forcedStyles);
            activateSlider(bar);

        }, 1000);
    });

})();
