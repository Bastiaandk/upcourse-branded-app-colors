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

    let forcedMode = null; // "light" or "dark"


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

            // The toggle bar itself should not be overwritten by snapshots
            if (
                el.id === "jiffy_toggle_bar" ||
                el.id === "jiffy_toggle_inner" ||
                el.id === "jiffy_switch" ||
                el.classList.contains("slider") ||
                el.id === "emoji_left" ||
                el.id === "emoji_right"
            ) {
                return;
            }

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

        // Restore bar tint after snapshot
        applyBarTint();
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
       EARLY CSS (classes only, no inline styles)
    -------------------------------------------- */
    function injectToggleCSS() {
        const css = `
        /* Base bar appearance */
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
            cursor: pointer;
            overflow: hidden;
            display:flex;
            align-items:center;
        }

        .slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            transition: transform 0.25s ease;
        }

        /* Visual toggle (active = right position) */
        #jiffy_switch.active .slider {
            transform: translateX(28px);
        }

        /* --------------------------------------------
           COLOR THEMES (class-based)
        -------------------------------------------- */

        /* Light mode */
        #jiffy_toggle_bar.jiffy-light {
            background: #ffffff;
            color: #111111;
        }
        #jiffy_toggle_bar.jiffy-light #jiffy_switch {
            background: #ffffff;
            border: 2px solid #cccccc;
        }
        #jiffy_toggle_bar.jiffy-light .slider {
            background: #444444;
            border: 1px solid #222222;
        }
        #jiffy_toggle_bar.jiffy-light #emoji_right {
            color: #111111;
        }

        /* Dark mode */
        #jiffy_toggle_bar.jiffy-dark {
            background: #111111;
            color: #ffffff;
        }
        #jiffy_toggle_bar.jiffy-dark #jiffy_switch {
            background: #111111;
            border: 2px solid #444444;
        }
        #jiffy_toggle_bar.jiffy-dark .slider {
            background: #f9f9f9;
            border: 1px solid #cccccc;
        }
        #jiffy_toggle_bar.jiffy-dark #emoji_right {
            color: #ffffff;
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
                <span id="emoji_left" style="font-size:22px;">debug 1 - 🎨</span>

                <div id="jiffy_switch">
                    <div class="slider"></div>
                </div>

                <span id="emoji_right" style="font-size:22px;">☾</span>
            </div>
        `;

        // Insert at top of body
        document.body.prepend(bar);

        // Fade in
        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });

        // Push site down
        const barHeight = bar.offsetHeight;
        document.body.style.paddingTop = barHeight + 'px';

        return bar;
    }


    /* --------------------------------------------
       APPLY THE CORRECT THEME (class-based)
    -------------------------------------------- */
    function applyBarTint() {
        const bar = document.getElementById("jiffy_toggle_bar");
        if (!bar) return;

        bar.classList.remove("jiffy-light", "jiffy-dark");
        bar.classList.add(`jiffy-${forcedMode}`);

        // Update slider position visually
        const switchEl = document.getElementById("jiffy_switch");
        if (!switchEl) return;

        if (forcedMode === "dark") {
            switchEl.classList.add("active");
        } else {
            switchEl.classList.remove("active");
        }
    }


    /* --------------------------------------------
       TOGGLE LOGIC
    -------------------------------------------- */
    function initToggleLogic() {
        const toggle = document.getElementById("jiffy_switch");

        toggle.addEventListener("click", () => {
            const active = toggle.classList.toggle("active");

            if (active) {
                applySnapshot(forcedStyles);
                forcedMode = forcedMode || "dark"; // fallback
            } else {
                applySnapshot(originalStyles);
                forcedMode = forcedMode || "light"; // fallback
            }

            applyBarTint();
            fixVideoBackgrounds();
        });
    }


    /* --------------------------------------------
       INIT
    -------------------------------------------- */

    document.addEventListener("DOMContentLoaded", () => {
        injectToggleCSS();
        const bar = injectToggleHTML();

        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));

        // Snapshot original
        originalBodyColor = getComputedStyle(document.body).color.trim();
        snapshotStyles(originalStyles);

        // After Kajabi dump
        setTimeout(() => {
            const bodyStyles = getComputedStyle(document.body);
            const currentBg = bodyStyles.backgroundColor.trim();

            // Detect forced mode
            if (currentBg.includes("16, 16, 16")) {
                forcedMode = "dark";
            } else {
                forcedMode = "light";
            }

            // Snapshot forced
            snapshotStyles(forcedStyles);

            // Fix videos
            fixVideoBackgrounds();

            // Apply theme tint
            applyBarTint();

            // Init toggle logic
            initToggleLogic();
        }, 1000);
    });
})();
