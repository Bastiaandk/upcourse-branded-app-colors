(function () {

    /* --------------------------------------------
    TOGGLE UI CSS
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

        /* slider movement */
        #jiffy_switch.active .slider {
            transform: translateX(28px);
        }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* --------------------------------------------
    TOGGLE UI HTML
    -------------------------------------------- */
    function injectToggleHTML(forcedMode) {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        const emoji = forcedMode === "dark" ? "☾" : "𖤓";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span id="emoji_left" style="font-size:22px;">debug 2 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div>
                </div>

                <span id="emoji_right" style="font-size:22px;">${emoji}</span>
            </div>
        `;

        return bar;
    }

    /* --------------------------------------------
    INIT TOGGLE BAR (UI ONLY)
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

        // Start the switch in the same mode as the original script
        switchEl.classList.add("active");

        // Toggle only affects the slider movement
        switchEl.addEventListener("click", () => {
            switchEl.classList.toggle("active");
        });

        // Light mode tint
        if (forcedMode === "light") {
            bar.style.background = "#f9f9f9";
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
    INIT (Minimal forcedMode detection stays)
    -------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
        const bodyStyles = getComputedStyle(document.body);
        const currentBg = bodyStyles.backgroundColor.trim();

        // original logic: detect dark/light
        let forcedMode = currentBg.includes("16, 16, 16") ? "dark" : "light";

        initToggleBar(forcedMode);
    });

})();
