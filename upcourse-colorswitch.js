(function () {
    /* --------------------------------------------
    MINIMAL CSS
    -------------------------------------------- */
    function injectCSS() {
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

        /* MOVEMENT */
        #jiffy_switch.active .slider {
            transform: translateX(28px);
        }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* --------------------------------------------
    MINIMAL HTML
    -------------------------------------------- */
    function injectHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug 2 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div>
                </div>

                <span style="font-size:22px;">☾</span>
            </div>
        `;

        const placeholder = document.getElementById("jiffy_bar_placeholder");
        if (placeholder) {
            placeholder.replaceWith(bar);
        } else {
            document.body.prepend(bar);
        }

        return bar;
    }

    /* --------------------------------------------
    ONLY UI ANIMATION (NO SIDE EFFECTS)
    -------------------------------------------- */
    function initToggle(bar) {
        const switchEl = bar.querySelector("#jiffy_switch");

        // Make it start inactive
        switchEl.classList.remove("active");

        switchEl.addEventListener("click", () => {
            switchEl.classList.toggle("active");
        });

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });
    }

    /* --------------------------------------------
    INIT
    -------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
        injectCSS();
        const bar = injectHTML();
        initToggle(bar);
    });
})();
