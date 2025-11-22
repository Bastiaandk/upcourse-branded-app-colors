(function () {

    /* --------------------------------------------
    CSS (origineel)
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
            background: #444;
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
    HTML (origineel)
    -------------------------------------------- */
    function injectToggleHTML(forcedMode) {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        const emoji = forcedMode === "dark" ? "☾" : "𖤓";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug 1 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div>
                </div>

                <span style="font-size:22px;">${emoji}</span>
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
    INIT BAR — originele timing + sliderfix
    -------------------------------------------- */
    function initToggleBar(forcedMode) {

        injectToggleCSS();

        const bar = injectToggleHTML(forcedMode);
        const placeholder = document.getElementById("jiffy_bar_placeholder");

        if (placeholder) {
            placeholder.replaceWith(bar);
        } else {
            document.body.prepend(bar);
        }

        const switchEl = bar.querySelector("#jiffy_switch");
        switchEl.classList.add("active");

        switchEl.addEventListener("click", () => {
            switchEl.classList.toggle("active");
            const isOn = switchEl.classList.contains("active");

            if (isOn) {
                applySnapshot(forcedStyles);
            } else {
                applySnapshot(originalStyles);
            }
        });

        /* --------------------------------------------
           SLIDER FIX — origineel gedrag precies hersteld
        -------------------------------------------- */
        if (forcedMode === "light") {
            const slider = bar.querySelector(".slider");
            if (slider) {
                slider.style.background = "#f9f9f9";
                slider.style.borderColor = "#ccc";
            }
        }

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });
    }

    /* --------------------------------------------
    INIT — ORIGINELE TIJD TERUG
    -------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));

        snapshotStyles(originalStyles);

        /* ★ DE CRUCIALE FIX ★  
           WACHT LAAT GENOEG DAT KAJABI UITGEHYDRATE IS */
        setTimeout(() => {

            snapshotStyles(forcedStyles);

            const bodyStyles = getComputedStyle(document.body);
            const currentBg = bodyStyles.backgroundColor.trim();
            const forcedMode = currentBg.includes("16, 16, 16") ? "dark" : "light";

            initToggleBar(forcedMode);

        }, 1000); // ← DEZE timing maakte jouw slider zichtbaar
    });

})();
