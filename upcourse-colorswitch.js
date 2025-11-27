(function () {

    /* -------------------------------------------------
       CONFIGURATION
    ------------------------------------------------- */

    const SELECTOR_LIST =
        'div,section,article,header,footer,main,aside,' +
        'span,p,a,li,ul,ol,' +
        'h1,h2,h3,h4,h5,h6,' +
        'strong,em,b,i,small,blockquote,mark,' +
        'img,button,label,[style]';

    const VIDEO_SELECTOR =
        '.block-type--video, .block-type--video *,' +
        '.block-type--gamify_video, .block-type--gamify_video *';


    /* -------------------------------------------------
       STYLE STORAGE
    ------------------------------------------------- */

    const originalStyles = new WeakMap();
    const forcedStyles = new WeakMap();
    let originalBodyColor = null;
    let elementsCache = [];
    let forcedMode = null;   // "light" or "dark"
    let uiMode = "forced";   // "forced" or "original"


    /* -------------------------------------------------
       SNAPSHOT: Save all page colors except toggle bar
    ------------------------------------------------- */

    function snapshotStyles(targetMap) {
        elementsCache.forEach((el) => {

            // Never snapshot the toggle bar or its children
            if (el.id === "jiffy_toggle_bar" || el.closest("#jiffy_toggle_bar")) return;

            const cs = getComputedStyle(el);

            targetMap.set(el, {
                color: cs.color,
                bg: cs.backgroundColor,
                inlineColor: el.style.color || null,
                inlineBg: el.style.backgroundColor || null,
            });
        });
    }


    /* -------------------------------------------------
       APPLY SNAPSHOT: Restore saved colors to page
    ------------------------------------------------- */

    function applySnapshot(snapshotMap) {
        elementsCache.forEach((el) => {

            // Never override the toggle bar's CSS class colors
            if (el.id === "jiffy_toggle_bar" || el.closest("#jiffy_toggle_bar")) return;

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


    /* -------------------------------------------------
       VIDEO FIX: Remove unwanted backgrounds from players
    ------------------------------------------------- */

    function fixVideoBackgrounds() {
        document.querySelectorAll(VIDEO_SELECTOR).forEach((el) => {
            el.style.removeProperty("background");
            el.style.removeProperty("background-color");
        });
    }


    /* -------------------------------------------------
       CSS INJECTION: Light/Dark Bar Styling
    ------------------------------------------------- */

    function injectToggleCSS() {
        const css = `
        .lessoncontainer {padding-top: 100px;}

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

        #jiffy_switch.active .slider::before {
            transform: translateX(28px);
        }

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


    /* -------------------------------------------------
       HTML INJECTION: Insert toggle bar early in DOM
    ------------------------------------------------- */

    function injectToggleHTML_EARLY() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
        <div id="jiffy_toggle_inner">
            <span id="emoji_left" style="font-size:22px;">🎨</span>

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


    /* -------------------------------------------------
       APPLY FORCED MODE: Set bar styling + slider position
    ------------------------------------------------- */

    function applyForcedModeToBar() {
        const bar = document.getElementById("jiffy_toggle_bar");
        const switchEl = document.getElementById("jiffy_switch");
        const emoji = document.getElementById("emoji_right");

        bar.classList.remove("jiffy-light", "jiffy-dark");
        bar.classList.add(forcedMode === "dark" ? "jiffy-dark" : "jiffy-light");

        emoji.textContent = forcedMode === "dark" ? "☾" : "𖤓";

        if (uiMode === "forced") {
            switchEl.classList.add("active");
        } else {
            switchEl.classList.remove("active");
        }
    }


    /* -------------------------------------------------
       INITIALIZATION
    ------------------------------------------------- */

    document.addEventListener("DOMContentLoaded", () => {

        injectToggleCSS();
        injectToggleHTML_EARLY();

        const bar = document.getElementById("jiffy_toggle_bar");

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        originalBodyColor = getComputedStyle(document.body).color.trim();
        snapshotStyles(originalStyles);


        /* -------------------------------------------------
           WAIT FOR KAJABI THEME COLORS (Dark/Light Detect)
        ------------------------------------------------- */

        function waitForKajabiColors(callback) {
            const start = performance.now();

            const check = () => {
                const bodyStyles = getComputedStyle(document.body);
                const currentColor = bodyStyles.color.trim();

                if (currentColor !== originalBodyColor) {
                    callback(bodyStyles);
                    return;
                }

                if (performance.now() - start > 3000) {
                    callback(null);
                    return;
                }

                requestAnimationFrame(check);
            };

            check();
        }


        /* -------------------------------------------------
           APPLY MODE AFTER KAJABI IS READY
        ------------------------------------------------- */

        waitForKajabiColors((bodyStyles) => {

            if (!bodyStyles) {
                bar.style.display = "none";
                return;
            }

            snapshotStyles(forcedStyles);

            const currentBg = bodyStyles.backgroundColor.trim();
            forcedMode = currentBg.includes("16, 16, 16") ? "dark" : "light";

            uiMode = "forced";

            applyForcedModeToBar();

            setTimeout(() => {
                bar.style.display = "block";
                fixVideoBackgrounds();

            }, 1250);

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
                    fixVideoBackgrounds();

                }

                applyForcedModeToBar();
            });

        });

    });

})();
