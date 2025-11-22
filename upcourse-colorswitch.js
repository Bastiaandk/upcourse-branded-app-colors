(function () {

    /* --------------------------------------------
    TOGGLE UI CSS (exact zoals origineel)
    -------------------------------------------- */
    function injectToggleCSS() {
        const css = `
        #jiffy_toggle_bar {
            width: 100%;
            padding: 5px 0;
            background: #111;            /* originele bar background */
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
            background: #111;            /* LET OP: dit is de kleur die de slider zichtbaar maakt */
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
            background: #444;            /* oorspronkelijk → hierdoor zie je hem in het echt */
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
    TOGGLE UI HTML (exact zoals origineel)
    -------------------------------------------- */
    function injectToggleHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug 3 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div>
                </div>

                <span style="font-size:22px;">☾</span>
            </div>
        `;

        return bar;
    }

    /* --------------------------------------------
    INIT TOGGLE BAR (UI only – geen side effects)
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

        /* EXACT zoals origineel:
           switch start in active mode → slider staat rechts en is goed zichtbaar */
        switchEl.classList.add("active");

        /* Alleen toggle movement */
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
        initToggleBar();
    });

})();
