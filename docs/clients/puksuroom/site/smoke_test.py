"""Browser smoke checks for the standalone Puksu Room website concept.

Install Playwright and Chromium as described in README.md. No venue service is
contacted: the remote image is intentionally blocked to exercise its fallback.
"""

import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    html = Path(__file__).with_name("index.html").read_text(encoding="utf-8")
    widths = [360, 390, 768, 1024, 1440]
    errors: list[str] = []
    executable = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
    launch_options = {"executable_path": executable} if executable else {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(**launch_options)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route("https://**/*", lambda route: route.abort())
        page.set_content(html)
        assert page.locator("html").get_attribute("lang") == "fi"
        assert "Biljardi." in page.locator("h1").inner_text()

        page.locator("#play").click()
        page.wait_for_timeout(700)
        assert int(page.locator("#timeline").input_value()) > 50
        page.locator("#play").click()
        paused = page.locator("#timeline").input_value()
        page.wait_for_timeout(150)
        assert paused == page.locator("#timeline").input_value()
        page.locator("#timeline").evaluate(
            '(el) => { el.value = "700"; '
            'el.dispatchEvent(new Event("input", {bubbles: true})); }'
        )
        assert page.locator("#timeline").input_value() == "700"
        page.locator("#tracking").uncheck()
        assert not page.locator("#tracking").is_checked()
        page.locator("#restart").click()
        assert page.locator("#timeline").input_value() == "0"

        page.locator("[data-lang=en]").click()
        assert page.locator("html").get_attribute("lang") == "en"
        assert "Pool." in page.locator("h1").inner_text()
        assert page.locator("#play").inner_text() == "▶ Play the shot"
        assert page.locator("#timeline").get_attribute("aria-label") == "Replay timeline"
        page.locator("#play").click()
        page.wait_for_function('document.querySelector("#timeline").value === "1000"')
        assert "Eight ball potted" in page.locator("#result").inner_text()

        anchors = page.locator('a[href^="#"]').evaluate_all(
            '(els) => els.map(el => el.getAttribute("href").slice(1))'
        )
        for anchor in anchors:
            assert page.locator(f'[id="{anchor}"]').count() == 1, anchor
        assert page.locator('a[target="_blank"]:not([rel*="noopener"])').count() == 0
        assert page.locator("form").count() == 0
        page.locator(".photo").scroll_into_view_if_needed()
        page.wait_for_function('document.querySelector(".photo").classList.contains("has-error")')
        page.locator("[data-lang=fi]").click()
        page.locator("#restart").click()
        page.locator("#tracking").check()

        for width in widths:
            page.set_viewport_size({"width": width, "height": 844})
            page.evaluate("window.scrollTo(0, 0)")
            for language in ["en", "fi"]:
                page.locator(f"[data-lang={language}]").click()
                assert page.evaluate(
                    "document.documentElement.scrollWidth <= innerWidth"
                ), f"Horizontal overflow: {language} at {width}px"
            if width == 390:
                page.locator(".menu-toggle").click()
                assert page.locator(".menu-toggle").get_attribute("aria-expanded") == "true"
                page.keyboard.press("Escape")
                assert page.locator(".menu-toggle").get_attribute("aria-expanded") == "false"

        page.emulate_media(reduced_motion="reduce")
        page.locator("#hero-play").click()
        assert page.locator("#timeline").input_value() == "1000"
        page.locator('a[href="#about-concept"]').first.click()
        assert page.locator("#about-concept details").get_attribute("open") is not None

        no_js = browser.new_page(java_script_enabled=False, viewport={"width": 390, "height": 844})
        no_js.route("https://**/*", lambda route: route.abort())
        no_js.set_content(html)
        assert no_js.locator("nav").is_visible()
        assert no_js.locator(".still").is_visible()
        assert no_js.locator("noscript").is_visible()
        assert not errors, errors
        browser.close()

    print(json.dumps({"result": "PASS", "widths": widths, "javascript_errors": errors}, indent=2))


if __name__ == "__main__":
    main()
