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

    /* --------------------------------------------
    SNAPSHOT
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

    /* --------------------------------------------
    APPLY SNAPSHOT
    -------------------------------------------- */

    function applySnapshot(snapshotMap) {
        elementsCache.forEach((el) => {
            const saved = snapshotMap.get(el);
            if (!saved) return;

            if (saved.inlineColor !== null) {
                el.style.setProperty('color', saved.inlineColor, 'important');
            } else {
                el.style.setProperty('color', saved.color, 'important');
            }

            if (saved.inlineBg !== null) {
                el.style.setProperty('background-color', saved.inlineBg, 'important');
            } else {
                el.style.setProperty('background-color', saved.bg, 'important');
            }
        });
    }

    /* --------------------------------------------
    VIDEO FIX
    -------------------------------------------- */

    function fixVideoBackgrounds() {
        document.querySelectorAll(VIDEO_SELECTOR).forEach((el) => {
            el.style.removeProperty('background');
            el.style.removeProperty('background-color');
        });
    }

    /* --------------------------------------------
    TOGGLE UI
    -------------------------------------------- */



    function injectToggleHTML(forcedMode) {
        const bar = document.createElement('div');
        bar.id = 'jiffy_toggle_bar';

        const emoji = forcedMode === 'dark' ? '☾' : '𖤓';

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
                <span id="emoji_left" style="font-size:22px;">debug-v4-🎨</span>
                <label id="jiffy_switch">
                    <input type="checkbox" id="jiffy_mode_toggle" />
                    <span class="slider"></span>
                </label>
                <span id="emoji_right" style="font-size:22px;">${emoji}</span>
            </div>
        `;

        return bar;
    }

    function initToggleBar(forcedMode) {
        injectToggleCSS();

        const bar = injectToggleHTML(forcedMode);

        /* --------------------------------------------
        CRITICAL FIX: Insert bar INSIDE lessoncontainer
        -------------------------------------------- */
        document.querySelector('.lessoncontainer').prepend(bar);

        const toggle = document.getElementById('jiffy_mode_toggle');
        toggle.checked = true;

        if (forcedMode === 'light') {
            bar.style.background = '#f9f9f9';
            const slider = bar.querySelector('.slider');
            if (slider) {
                slider.style.background = '#f9f9f9';
                slider.style.borderColor = '#ccc';
            }
        }

        requestAnimationFrame(() => {
            bar.style.opacity = 1;
        });

        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                applySnapshot(forcedStyles);
                fixVideoBackgrounds();
            } else {
                applySnapshot(originalStyles);
            }
        });
    }

    /* --------------------------------------------
    INIT
    -------------------------------------------- */

    document.addEventListener('DOMContentLoaded', () => {
        elementsCache = Array.from(document.querySelectorAll(SELECTOR_LIST));
        originalBodyColor = getComputedStyle(document.body).color.trim();

        snapshotStyles(originalStyles);

        setTimeout(() => {
            const bodyStyles = getComputedStyle(document.body);

            const currentColor = bodyStyles.color.trim();
            const currentBg = bodyStyles.backgroundColor.trim();

            if (currentColor !== originalBodyColor) {
                snapshotStyles(forcedStyles);
                fixVideoBackgrounds();

                let forcedMode = 'light';

                if (currentBg.includes('16, 16, 16')) forcedMode = 'dark';
                if (currentBg.includes('255, 255, 255')) forcedMode = 'light';

                initToggleBar(forcedMode);
            }
        }, 1000);
    });
})();
