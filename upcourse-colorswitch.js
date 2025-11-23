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
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 5px 0;
            z-index: 999999999;
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
            <span id="emoji_left" style="font-size:22px;">debug 2 - 🎨</span>

            <label id="jiffy_switch">
                <input type="checkbox" id="jiffy_mode_toggle" />
                <span class="slider"></span>
            </label>

            <span id="emoji_right" style="font-size:22px;">☾</span>
        </div>
    `;

        document.body.prepend(bar);
        return bar;
    }


    /* --------------------------------------------
    MODE APPLICATION
    -------------------------------------------- */

    function applyForcedModeToBar() {
        const bar = document.getElementById("jiffy_toggle_bar");
        const switchEl = document.getElementById("jiffy_switch");
        const emoji = document.getElementById("emoji_right");

        // Bar krijgt ALTIJD de kleuren van forcedMode
        bar.classList.remove("jiffy-light", "jiffy-dark");
        bar.classList.add(forcedMode === "dark" ? "jiffy-dark" : "jiffy-light");

        // Emoji afhankelijk van mode
        emoji.textContent = forcedMode === "dark" ? "☾" : "𖤓";

        // Slider rechts = onze kleuren aan
        if (uiMode === "forced") {
            switchEl.classList.add("active");
        } else {
            switchEl.classList.remove("active");
        }
    }



    /* --------------------------------------------
    INIT
    -------------------------------------------- */

    document.addEventListener("DOMContentLoaded", () => {

        injectToggleCSS();
        injectToggleHTML_EARLY();

        const bar = document.getElementById("jiffy_toggle_bar");

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        originalBodyColor = getComputedStyle(document.body).color.trim();
        snapshotStyles(originalStyles);

        /* --------------------------------------------
           INTELLIGENTE KAJABI DARK/LIGHT DETECTIE
        -------------------------------------------- */
        function waitForKajabiColors(callback) {
            const start = performance.now();

            const check = () => {
                const bodyStyles = getComputedStyle(document.body);
                const currentColor = bodyStyles.color.trim();

                // Klaar → Kajabi heeft kleuren toegepast
                if (currentColor !== originalBodyColor) {
                    callback(bodyStyles);
                    return;
                }

                // Safety timeout (3 sec) → Kajabi heeft GEEN dark/light
                if (performance.now() - start > 3000) {
                    callback(null);
                    return;
                }

                // Nog niet klaar → opnieuw checken
                requestAnimationFrame(check);
            };

            check();
        }

        /* --------------------------------------------
           UITVOEREN ZODRA KAJABI GEREED IS
        -------------------------------------------- */
        waitForKajabiColors((bodyStyles) => {

            // Geen dark/light → bar blijft verborgen
            if (!bodyStyles) {
                bar.style.display = "none";
                return;
            }

            // WEL dark/light
            snapshotStyles(forcedStyles);
            fixVideoBackgrounds();

            const currentBg = bodyStyles.backgroundColor.trim();
            forcedMode = currentBg.includes("16, 16, 16") ? "dark" : "light";

            uiMode = "forced"; // altijd starten in forced mode

            // Bar kleuren toepassen
            applyForcedModeToBar();

            // Bar tonen (met jouw 1250ms)
            setTimeout(() => {
                bar.style.display = "block";
            }, 1250);

            // Toggle activeren
            const toggle = document.getElementById("jiffy_mode_toggle");
            toggle.checked = true;

            toggle.addEventListener("change", () => {
                if (toggle.checked) {
                    uiMode = "forced";
                    applySnapshot(forcedStyles);
                    fixVideoBackgrounds();
                } else {
                    uiMode = "original";
                    applySnapshot(originalStyles);
                }

                // Alleen sliderpositie/bar-mode
                applyForcedModeToBar();
            });

        });


    });


})();
