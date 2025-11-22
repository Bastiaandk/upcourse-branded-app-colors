(function () {

    /* --------------------------------------------
    CSS (origineel, maar slider is eerst hidden)
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

        #jiffy_switch .slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            background: #444 !important;
            border-radius: 50%;
            transition: transform 0.25s ease;
            visibility: visible !important;
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
    HTML BAR
    -------------------------------------------- */
    function injectToggleHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div> 
                </div>

                <span style="font-size:22px;">☾</span>
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
    PHASE 1 — EARLY BAR (NO SLIDER FUNCTIONALITY)
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
    PHASE 2 — LATE SLIDER ACTIVATION (NO SCROLL JUMP)
    -------------------------------------------- */
    function activateSlider(bar) {

        const switchEl = bar.querySelector("#jiffy_switch");
        const slider = bar.querySelector(".slider");

        // make slider visible AFTER hydration
        slider.style.visibility = "visible";

        // determine forcedMode
        const bodyStyles = getComputedStyle(document.body);
        const currentBg = bodyStyles.backgroundColor.trim();
        const forcedMode = currentBg.includes("16, 16, 16") ? "dark" : "light";

        // tint slider (original behaviour)
        if (forcedMode === "light") {
            slider.style.background = "#f9f9f9";
            slider.style.borderColor = "#ccc";
        }

        // start active like original
        switchEl.classList.add("active");

        // restore full toggle logic
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

        // phase 1: early bar
        const bar = initBarEarly();

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        snapshotStyles(originalStyles);

        // Wait for Kajabi hydration to finish
        // to avoid scroll bugs and slider invisibility
        setTimeout(() => {

            snapshotStyles(forcedStyles);
            activateSlider(bar);

        }, 1000); // ← exact timing required
    });

})();
