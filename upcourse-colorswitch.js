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

            el.style.setProperty('color',
                saved.inlineColor !== null ? saved.inlineColor : saved.color,
                'important'
            );

            el.style.setProperty('background-color',
                saved.inlineBg !== null ? saved.inlineBg : saved.bg,
                'important'
            );
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

        #jiffy_switch.active .slider {
            transform: translateX(28px);
        }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* --------------------------------------------
    TOGGLE UI HTML
    -------------------------------------------- */

    function injectToggleHTML(forcedMode) {
        const bar = document.createElement('div');
        bar.id = 'jiffy_toggle_bar';

        const emoji = forcedMode === 'dark' ? '☾' : '𖤓';

        bar.innerHTML = `
            <div id="jiffy_toggle_inner">
<p>123123123</p>
            </div>
        `;

        return bar;
    }

    /* --------------------------------------------
    INIT TOGGLE BAR
    -------------------------------------------- */

    function initToggleBar(forcedMode) {
        injectToggleCSS();

        const bar = injectToggleHTML(forcedMode);

        /* SAFE INSERT */
        const container = document.querySelector('.lessoncontainer');
        container.insertBefore(bar, container.firstChild);

        /* ---- NEW PURE-DIV SWITCH ---- */
        const switchEl = bar.querySelector('#jiffy_switch');
        switchEl.classList.add('active'); // start in forced mode

        switchEl.addEventListener('click', () => {
            switchEl.classList.toggle('active');
            const isOn = switchEl.classList.contains('active');

            if (isOn) {
                applySnapshot(forcedStyles);
                fixVideoBackgrounds();
            } else {
                applySnapshot(originalStyles);
            }
        });

        /* Optional: Light mode tint */
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

                let forcedMode = currentBg.includes('16, 16, 16') ? 'dark' : 'light';

                initToggleBar(forcedMode);
            }
        }, 1000);
    });
})();
