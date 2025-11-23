(function () {

    /* --------------------------------------------
    SELECTORS
    -------------------------------------------- */
    const SELECTOR_LIST =
        'div,section,article,header,footer,main,aside,' +
        'span,p,a,li,ul,ol,' +
        'h1,h2,h3,h4,h5,h6,' +
        'strong,em,b,i,small,blockquote,mark,' +
        'img,button,label,[style]';

    const VIDEO_SELECTOR =
        '.block-type--video, .block-type--video *,' +
        '.block-type--gamify_video, .block-type--gamify_video *';

    /* --------------------------------------------
    SNAPSHOT STORAGE
    -------------------------------------------- */
    const originalStyles = new WeakMap();
    const forcedStyles = new WeakMap();
    let elementsCache = [];
    let originalBodyColor = null;

    /* --------------------------------------------
    SNAPSHOT LOGIC
    -------------------------------------------- */

    function snapshotStyles(targetMap) {
        elementsCache.forEach((el) => {

            // Skip the toggle bar and everything inside it
            if (el.id === "jiffy_toggle_bar") return;
            if (el.closest && el.closest("#jiffy_toggle_bar")) return;

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

            // Skip toggle bar
            if (el.id === "jiffy_toggle_bar") return;
            if (el.closest && el.closest("#jiffy_toggle_bar")) return;

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
    VIDEO FIX
    -------------------------------------------- */
    function fixVideoBackgrounds() {
        document.querySelectorAll(VIDEO_SELECTOR).forEach((el) => {
            el.style.removeProperty('background');
            el.style.removeProperty('background-color');
        });
    }

    /* --------------------------------------------
    CSS (CLASS-BASED THEMING)
    -------------------------------------------- */
    function injectToggleCSS() {
        const css = `
        #jiffy_toggle_bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 5px 0;
            z-index: 999999999;
            opacity: 0;
            transition: opacity 0.4s ease;
        }

        /* LIGHT MODE */
        #jiffy_toggle_bar.jiffy-light {
            background: #ffffff;
            color: #222222;
        }

        /* DARK MODE */
        #jiffy_toggle_bar.jiffy-dark {
            background: #111111;
            color: #f9f9f9;
        }

        #jiffy_toggle_inner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
        }

        /* SWITCH OUTLINE */
        #jiffy_switch {
            position: relative;
            width: 60px;
            height: 30px;
            border-radius: 20px;
            border: 2px solid currentColor;
            background: transparent;
            cursor: pointer;
        }

        /* SLIDER BALL */
        #jiffy_switch .slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: currentColor;
            transition: transform 0.25s ease;
        }

        /* ACTIVE (slider right) */
        #jiffy_switch.active .slider {
            transform: translateX(28px);
        }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* --------------------------------------------
    EARLY HTML INJECTION
    -------------------------------------------- */
    function injectToggleHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span id="emoji_left" style="font-size:22px;">debug - 🎨</span>

                <div id="jiffy_switch">
                    <div class="slider"></div>
                </div>

                <span id="emoji_right" style="font-size:22px;">☾</span>
            </div>
        `;
        return bar;
    }

    /* --------------------------------------------
    APPLY MODE
    -------------------------------------------- */
    function applyMode(bar, mode) {
        const toggle = bar.querySelector("#jiffy_switch");
        const emoji = bar.querySelector("#emoji_right");

        bar.classList.remove("jiffy-light", "jiffy-dark");

        if (mode === "dark") {
            bar.classList.add("jiffy-dark");
            toggle.classList.add("active");
            emoji.textContent = "☾";
        } else {
            bar.classList.add("jiffy-light");
            toggle.classList.remove("active");
            emoji.textContent = "𖤓";
        }
    }

    /* --------------------------------------------
    RESTORE SLIDER AFTER SNAPSHOT
    -------------------------------------------- */
    function restoreSliderMode(bar, mode) {
        applyMode(bar, mode);
    }

    /* --------------------------------------------
    INIT
    -------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {

        /* Inject CSS + early bar */
        injectToggleCSS();
        const bar = injectToggleHTML();
        document.body.prepend(bar);

        /* Push content down */
        document.body.style.paddingTop = bar.offsetHeight + "px";

        /* Fade-in */
        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });

        /* Snapshot original */
        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        originalBodyColor = getComputedStyle(document.body).color.trim();
        snapshotStyles(originalStyles);

        /* Wait for Kajabi's dump */
        setTimeout(() => {

            const bodyStyles = getComputedStyle(document.body);
            const currentBg = bodyStyles.backgroundColor.trim();

            let forcedMode = "light";
            if (currentBg.includes("16, 16, 16")) forcedMode = "dark";

            /* Snapshot forced styles */
            snapshotStyles(forcedStyles);
            fixVideoBackgrounds();

            /* Apply forced mode colors */
            applyMode(bar, forcedMode);

            /* Toggle logic */
            const toggle = bar.querySelector("#jiffy_switch");

            toggle.addEventListener("click", () => {
                const isActive = toggle.classList.toggle("active");

                if (isActive) {
                    applySnapshot(forcedStyles);
                    restoreSliderMode(bar, forcedMode);
                } else {
                    applySnapshot(originalStyles);
                    restoreSliderMode(bar, forcedMode);
                }
            });

        }, 900); // 900ms is smoother than 1000ms

    });

})();
