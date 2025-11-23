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
    STORAGE
    -------------------------------------------- */

    const originalStyles = new WeakMap();
    const forcedStyles = new WeakMap();
    let originalBodyColor = null;
    let elementsCache = [];
    let forcedMode = null;     // "light" of "dark"
    let uiMode = "forced";     // "forced" of "original"

    /* --------------------------------------------
    SNAPSHOTS
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
            el.style.removeProperty("background");
            el.style.removeProperty("background-color");
        });
    }

    /* --------------------------------------------
    CSS (Light/Dark Classes)
    -------------------------------------------- */

    function injectToggleCSS() {
        const css = `
        /* BASIS BAR */
        #jiffy_toggle_bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 5px 0;
            z-index: 999999999;
            display: block;
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

        /* SWITCH BASIS */
        #jiffy_switch {
            position: relative;
            width: 60px;
            height: 30px;
            border-radius: 20px;
        }

        #jiffy_switch input {
            position: absolute;
            width: 60px;
            height: 30px;
            opacity: 0;
            cursor: pointer;
            z-index: 3;
        }

        #jiffy_switch .slider {
            position: absolute;
            top: 0;
            left: 0;
            width: 60px;
            height: 30px;
            border-radius: 20px;
            border: 2px solid #444;
            transition: background-color 0.25s ease, border-color 0.25s ease;
        }

        #jiffy_switch .slider::before {
            content: "";
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            transition: transform 0.25s ease, background-color 0.25s ease;
        }

        /* SLIDER RECHTS = active (onze kleuren aan) */
        #jiffy_switch.active .slider::before {
            transform: translateX(28px);
        }

        /* LIGHT MODE */
        #jiffy_toggle_bar.jiffy-light {
            background: #ffffff;
            color: #111111;
        }
        #jiffy_toggle_bar.jiffy-light #emoji_right {
            color: #111111;
        }
        #jiffy_toggle_bar.jiffy-light #jiffy_switch .slider {
            background: #ffffff;
            border-color: #cccccc;
        }
        #jiffy_toggle_bar.jiffy-light #jiffy_switch .slider::before {
            background: #444444;
        }

        /* DARK MODE */
        #jiffy_toggle_bar.jiffy-dark {
            background: #111111;
            color: #ffffff;
        }
        #jiffy_toggle_bar.jiffy-dark #emoji_right {
            color: #ffffff;
        }
        #jiffy_toggle_bar.jiffy-dark #jiffy_switch .slider {
            background: #111111;
            border-color: #444444;
        }
        #jiffy_toggle_bar.jiffy-dark #jiffy_switch .slider::before {
            background: #dddddd;
        }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* --------------------------------------------
    EARLY HTML
    -------------------------------------------- */

    function injectToggleHTML_EARLY() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span id="emoji_left" style="font-size:22px;">debug 1 🎨</span>

                <label id="jiffy_switch">
                    <input type="checkbox" id="jiffy_mode_toggle" />
                    <span class="slider"></span>
                </label>

                <span id="emoji_right" style="font-size:22px;">☾</span>
            </div>
        `;

        document.body.prepend(bar);
        bar.style.display = "none";   // bar is standaard verborgen
        return bar;

    }

    /* --------------------------------------------
    MODE APPLICATION
    -------------------------------------------- */

    function applyForcedModeToBar() {
        const bar = document.getElementById("jiffy_toggle_bar");
        const switchEl = document.getElementById("jiffy_switch");
        const emoji = document.getElementById("emoji_right");

        bar.classList.remove("jiffy-light", "jiffy-dark");

        if (forcedMode === "dark") {
            bar.classList.add("jiffy-dark");
            emoji.textContent = "☾";
        } else {
            bar.classList.add("jiffy-light");
            emoji.textContent = "𖤓";
        }

        // Slider positiesysteem volgens jouw regels:
        if (uiMode === "forced") {
            switchEl.classList.add("active");    // altijd rechts
        } else {
            switchEl.classList.remove("active"); // altijd links
        }
    }

    /* --------------------------------------------
    INIT
    -------------------------------------------- */

    document.addEventListener("DOMContentLoaded", () => {

        injectToggleCSS();
        injectToggleHTML_EARLY();

        const bar = document.getElementById("jiffy_toggle_bar");

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        originalBodyColor = getComputedStyle(document.body).color.trim();
        snapshotStyles(originalStyles);

        /* AFTER KAJABI */
        setTimeout(() => {

            const bodyStyles = getComputedStyle(document.body);
            const currentColor = bodyStyles.color.trim();
            const currentBg = bodyStyles.backgroundColor.trim();

            if (currentColor !== originalBodyColor) {

                snapshotStyles(forcedStyles);
                fixVideoBackgrounds();

                forcedMode =
                    currentBg.includes("16, 16, 16") ? "dark" : "light";

                uiMode = "forced";  // altijd start op forced

                applyForcedModeToBar();

                bar.style.display = "block";   // bar nu tonen

                const toggle = document.getElementById("jiffy_mode_toggle");
                toggle.checked = true;  // forced = on

                toggle.addEventListener("change", () => {
                    if (toggle.checked) {
                        uiMode = "forced";
                        applySnapshot(forcedStyles);
                        fixVideoBackgrounds();
                    } else {
                        uiMode = "original";
                        applySnapshot(originalStyles);
                    }

                    applyForcedModeToBar();
                });
            }
        }, 1000);
    });

})();
