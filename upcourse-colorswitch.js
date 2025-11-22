const bar = document.createElement("div");
bar.id = "jiffy_toggle_bar";

const emoji = forcedMode === "dark" ? "☾" : "𖤓";

bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span id="emoji_left" style="font-size:22px;">debug - 1 - 🎨</span>

                <div id="jiffy_switch" aria-role="switch">
                    <div class="slider"></div>
                </div>

                <span id="emoji_right" style="font-size:22px;">${emoji}</span>
            </div>
        `;

return bar;