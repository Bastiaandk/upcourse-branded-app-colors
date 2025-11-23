(function () {

    /* --------------------------------------------
    CONFIG
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
            if (el.id === "jiffy_toggle_bar") return;
            if (el.closest("#jiffy_toggle_bar")) return;

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
            background: #f9f9f9;
            color: #222;
        }
        #jiffy_toggle_bar.jiffy-light #jiffy_switch .slider {
            background: #444;
            border: 1px solid #222;
        }

        /* DARK MODE */
        #jiffy_toggle_bar.jiffy-dark {
            background: #111;
            color: #f9f9f9;
        }
        #jiffy_toggle_bar.jiffy-dark #jiffy_switch .slider {
            background: #eee;
            border: 1px solid #666;
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
            border-radius: 20px;
            background: transparent;
            cursor: pointer;
        }

        #jiffy_switch .slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            transition: transform 0.25s ease;
        }

        /* ACTIVE = slider right side */
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
                <span id="emoji_left" style="font-size:22px;">🎨</span>

                <div id="jiffy_switch">
                    <div class="slider"></div>
                </div>

                <span id="emoji_right" style="font-size:22px;">☾</span>
            </div>
        `;

        return bar;
    }

    /* --------------------------------------------
    SET MODE CLASSES + SLIDER POSITION
    -------------------------------------------- */
    function applyMode(bar, forcedMode) {
        bar.classList.remove("jiffy-light", "jiffy-dark");

        if (forcedMode === "dark") {
            bar.classList.add("jiffy-dark");
            bar.querySelector("#jiffy_switch").classList.add("active");
            bar.querySelector("#emoji_right").textContent = "☾";
        } else {
            bar.classList.add("jiffy-light");
            bar.querySelector("#jiffy_switch").classList.remove("active");
            bar.querySelector("#emoji_right").textContent = "𖤓";
        }
    }

    /* --------------------------------------------
    RESTORE SLIDER COLORS AFTER SNAPSHOT
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

        /* Fade-in */
        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });

        /* Snapshot original */
        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        originalBodyColor = getComputedStyle(document.body).color.trim();
        snapshotStyles(originalStyles);

        /* Delay for Kajabi's color dump */
        setTimeout(() => {

            const bodyStyles = getComputedStyle(document.body);
            const currentBg = bodyStyles.backgroundColor.trim();

            let forcedMode = "light";
            if (currentBg.includes("16, 16, 16")) forcedMode = "dark";

            /* Snapshot forced styles */
            snapshotStyles(forcedStyles);
            fixVideoBackgrounds();

            /* Apply forced mode to bar */
            applyMode(bar, forcedMode);

            /* Toggle: apply snapshots + restore slider tint */
            const toggle = document.querySelector("#jiffy_switch");
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

        }, 1000);

    });

})();
