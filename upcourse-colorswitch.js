(function () {
    // Inject minimal CSS
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
        }
        `;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Inject minimal HTML
    function injectHTML() {
        const bar = document.createElement("div");
        bar.id = "jiffy_toggle_bar";

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span style="font-size:22px;">debug - stripped - 🎨</span>
                <div id="jiffy_switch">
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

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        injectCSS();
        injectHTML();
    });
})();
