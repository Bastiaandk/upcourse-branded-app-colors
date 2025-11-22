(function () {

    /* --------------------------------------------
    CSS (zonder wijzigingen)
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
    HTML
    -------------------------------------------- */
    function injectToggleHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug 1 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div>
                </div>

                <span style="font-size:22px;">☾</span>
            </div>
        `;

        return bar;
    }

    /* --------------------------------------------
    snapshotStyles (geen writes)
    -------------------------------------------- */
    const SELECTOR_LIST =
        'div,section,article,header,footer,main,aside,' +
        'span,p,a,li,ul,ol,' +
        'h1,h2,h3,h4,h5,h6,' +
        'strong,em,b,i,small,blockquote,mark,' +
        'img,button,label,[style]';

    let elementsCache = [];
    const snapshotMap = new WeakMap();

    function snapshotStyles() {
        elementsCache.forEach((el) => {
            const cs = getComputedStyle(el);
            snapshotMap.set(el, {
                color: cs.color,
                bg: cs.backgroundColor,
                inlineColor: el.style.color || null,
                inlineBg: el.style.backgroundColor || null,
            });
        });
    }

    /* --------------------------------------------
    fixVideoBackgrounds
    -------------------------------------------- */
    const VIDEO_SELECTOR =
        '.block-type--video, .block-type--video *,' +
        '.block-type--gamify_video, .block-type--gamify_video *';

    function fixVideoBackgrounds() {
        document.querySelectorAll(VIDEO_SELECTOR).forEach((el) => {
            el.style.removeProperty("background");
            el.style.removeProperty("background-color");
        });
    }

    /* --------------------------------------------
    INIT BAR
    -------------------------------------------- */
    function initToggleBar() {
        injectToggleCSS();

        const bar = injectToggleHTML();
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

            // test only: snapshot + fixVideoBackgrounds
            snapshotStyles();
            fixVideoBackgrounds();

            console.log("Test #2: snapshotStyles + fixVideoBackgrounds executed");
        });

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });
    }

    /* --------------------------------------------
    INIT
    -------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));

        // eerste scan maar GEEN wijzigingen
        snapshotStyles();

        initToggleBar();
    });

})();
