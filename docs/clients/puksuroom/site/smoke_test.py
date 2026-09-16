"""Browser checks for the self-contained Puksu Room concept and physical replay.

Run with Playwright/Chromium installed. Network access is blocked; the external
venue image deliberately fails so its typographic fallback is tested as well.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright


def seek(page, progress: int) -> None:
    page.locator('#timeline').evaluate(
        '(el, value) => { el.value = String(value); '
        'el.dispatchEvent(new Event("input", {bubbles: true})); }', progress)


def main() -> None:
    html = Path(__file__).with_name('index.html').read_text(encoding='utf-8')
    widths = [360, 390, 768, 1024, 1440]
    errors: list[str] = []
    executable = os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
    launch = {'executable_path': executable} if executable else {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(**launch)
        page = browser.new_page(viewport={'width': 1440, 'height': 1100})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.route('https://**/*', lambda route: route.abort())
        page.set_content(html)
        assert page.locator('html').get_attribute('lang') == 'fi'
        assert 'Biljardi.' in page.locator('h1').inner_text()
        assert page.locator('#table').get_attribute('data-replay-model') == 'rigid-sphere-v1'
        assert page.locator('#cue-speed').inner_text() == '1.05 m/s'
        assert page.locator('#eight-speed').inner_text() == '0.00 m/s'
        assert page.locator('#duration').inner_text() == '00:03.24'

        page.locator('#play').click()
        page.wait_for_timeout(500)
        assert int(page.locator('#timeline').input_value()) > 50
        page.locator('#play').click()
        paused = page.locator('#timeline').input_value()
        page.wait_for_timeout(150)
        assert paused == page.locator('#timeline').input_value()
        seek(page, 700)
        assert page.locator('#timeline').input_value() == '700'
        page.locator('#tracking').uncheck()
        assert not page.locator('#tracking').is_checked()
        page.locator('#restart').click()
        assert page.locator('#timeline').input_value() == '0'

        # Inspect UI one slider increment before/after actual calculated impact.
        contact = page.evaluate('''() => { const r=BiljarditutkaPhysics.replay();
            return 1000*r.events.find(e=>e.type==='ball').time/r.duration; }''')
        seek(page, int(contact) - 1)
        assert page.locator('#eight-speed').inner_text() == '0.00 m/s'
        cue_in = float(page.locator('#cue-speed').inner_text().split()[0])
        assert cue_in > .9
        seek(page, int(contact) + 1)
        eight_out = float(page.locator('#eight-speed').inner_text().split()[0])
        assert 0 < eight_out <= cue_in
        assert 'Osuma' in page.locator('#result').inner_text()
        assert page.locator('#timeline').get_attribute('aria-valuetext')

        page.locator('[data-lang=en]').click()
        assert page.locator('html').get_attribute('lang') == 'en'
        assert 'Pool.' in page.locator('h1').inner_text()
        assert page.locator('#play').inner_text() == '▶ Play the shot'
        assert page.locator('#timeline').get_attribute('aria-label') == 'Replay timeline'
        assert 'Slow motion' in page.locator('#slow').inner_text()
        page.locator('#restart').click()
        page.locator('#slow').click()
        assert page.locator('#slow').get_attribute('aria-pressed') == 'true'
        page.locator('#play').click()
        page.wait_for_timeout(450)
        page.locator('#play').click()
        assert .05 < float(page.locator('#table').get_attribute('data-sim-time')) < .35
        assert page.locator('#table').get_attribute('data-playback-rate') == '0.25'
        page.locator('#slow').click()
        assert page.locator('#slow').get_attribute('aria-pressed') == 'false'
        page.locator('#play').click()
        page.wait_for_function('document.querySelector("#timeline").value === "1000"')
        assert 'Eight ball potted' in page.locator('#result').inner_text()
        assert page.locator('#cue-speed').inner_text() == '0.00 m/s'
        assert page.locator('#eight-speed').inner_text() == '0.00 m/s'

        # Out-of-view/hidden playback must pause, not continue consuming animation frames.
        page.locator('#restart').click()
        page.locator('#play').click()
        page.locator('.photo').scroll_into_view_if_needed()
        page.wait_for_timeout(150)
        paused = page.locator('#timeline').input_value()
        page.wait_for_timeout(150)
        assert paused == page.locator('#timeline').input_value()
        page.wait_for_function('document.querySelector(".photo").classList.contains("has-error")')
        page.locator('[data-lang=fi]').click()
        page.locator('#restart').click()
        page.locator('#play').click()
        page.evaluate('''() => {Object.defineProperty(document,'hidden',{configurable:true,value:true});
            document.dispatchEvent(new Event('visibilitychange'));}''')
        paused = page.locator('#timeline').input_value()
        page.wait_for_timeout(150)
        assert paused == page.locator('#timeline').input_value()
        page.evaluate("delete document.hidden")

        anchors = page.locator('a[href^="#"]').evaluate_all(
            '(els) => els.map(el => el.getAttribute("href").slice(1))')
        for anchor in anchors:
            assert page.locator(f'[id="{anchor}"]').count() == 1, anchor
        assert page.locator('a[target="_blank"]:not([rel*="noopener"])').count() == 0
        assert page.locator('form').count() == 0
        page.locator('#tracking').check()
        for width in widths:
            page.set_viewport_size({'width': width, 'height': 844})
            page.evaluate('window.scrollTo(0, 0)')
            for language in ['en', 'fi']:
                page.locator(f'[data-lang={language}]').click()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), \
                    f'Horizontal overflow: {language} at {width}px'
            if width == 390:
                page.locator('.menu-toggle').click()
                assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'true'
                page.keyboard.press('Escape')
                assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'false'
        page.emulate_media(reduced_motion='reduce')
        page.locator('#hero-play').click()
        assert page.locator('#timeline').input_value() == '1000'
        page.locator('a[href="#about-concept"]').first.click()
        assert page.locator('#about-concept details').get_attribute('open') is not None

        no_js = browser.new_page(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        no_js.route('https://**/*', lambda route: route.abort())
        no_js.set_content(html)
        assert no_js.locator('nav').is_visible()
        assert no_js.locator('.still').is_visible()
        assert no_js.locator('noscript').is_visible()
        assert not errors, errors
        browser.close()
    print(json.dumps({'result': 'PASS', 'widths': widths, 'javascript_errors': errors,
                     'physics_controls': 'contact speeds, quarter speed, deterministic seeking, rest'}, indent=2))


if __name__ == '__main__':
    main()
