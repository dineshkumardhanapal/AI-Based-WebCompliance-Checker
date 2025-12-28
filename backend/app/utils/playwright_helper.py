"""
Playwright Helper

Handles browser automation using Playwright (Python equivalent of Puppeteer).
Uses sync_playwright in a thread to avoid Windows asyncio subprocess issues.
"""

from playwright.sync_api import sync_playwright, Browser, Page, TimeoutError as PlaywrightTimeoutError
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

_browser: Browser = None
_playwright = None
_executor = ThreadPoolExecutor(max_workers=2)

def _get_browser_sync() -> Browser:
    """Get or create a browser instance (synchronous)"""
    global _browser, _playwright
    
    if _browser is None or not _browser.is_connected():
        if _playwright is None:
            _playwright = sync_playwright().start()
        _browser = _playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--no-first-run',
                '--no-zygote',
                '--disable-blink-features=AutomationControlled',
            ],
            timeout=30000,
        )
    
    return _browser

def _close_browser_sync():
    """Close browser and cleanup resources (synchronous)"""
    global _browser, _playwright
    
    if _browser:
        try:
            _browser.close()
        except:
            pass
        _browser = None
    
    if _playwright:
        try:
            _playwright.stop()
        except:
            pass
        _playwright = None

async def close_browser():
    """Close browser and cleanup resources (async wrapper)"""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, _close_browser_sync)

def _analyze_webpage_sync(url: str):
    """
    Analyze a webpage and extract accessibility data (synchronous).
    
    Args:
        url: URL of the webpage to analyze
        
    Returns:
        Dictionary containing HTML, accessibility tree, page data, and styles
    """
    browser = _get_browser_sync()
    page = browser.new_page()
    
    try:
        # Set viewport
        page.set_viewport_size({"width": 1280, "height": 720})
        
        # Set timeout for page load
        page.set_default_timeout(30000)
        
        # Navigate to the page
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
        except PlaywrightTimeoutError:
            raise Exception("Page load timeout")
        
        # Wait for dynamic content
        page.wait_for_timeout(1000)
        
        # Extract HTML content
        html = page.content()
        
        # Get accessibility tree
        accessibility_tree = page.accessibility.snapshot()
        
        # Extract all relevant data
        page_data = page.evaluate("""() => {
            // Get all interactive elements
            const interactiveElements = [];
            const allElements = document.querySelectorAll('*');
            
            allElements.forEach(el => {
                const tagName = el.tagName.toLowerCase();
                const isInteractive = 
                    ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'].includes(tagName) ||
                    el.hasAttribute('onclick') ||
                    el.hasAttribute('role') ||
                    el.tabIndex >= 0;
                
                if (isInteractive) {
                    interactiveElements.push({
                        tag: tagName,
                        id: el.id || null,
                        className: el.className || null,
                        text: el.textContent?.trim().substring(0, 100) || null,
                        tabIndex: el.tabIndex,
                        ariaLabel: el.getAttribute('aria-label') || null,
                        ariaLabelledBy: el.getAttribute('aria-labelledby') || null,
                        role: el.getAttribute('role') || null,
                        type: el.getAttribute('type') || null,
                        disabled: el.disabled || false,
                        href: el.href || null,
                        hasOnclick: el.hasAttribute('onclick') || el.onclick !== null,
                    });
                }
            });
            
            // Get all images
            const images = Array.from(document.images).map(img => ({
                src: img.src,
                alt: img.alt || null,
                title: img.title || null,
                hasAlt: !!img.alt,
            }));
            
            // Get all headings
            const headings = [];
            for (let i = 1; i <= 6; i++) {
                const hElements = Array.from(document.querySelectorAll(`h${i}`));
                headings.push(...hElements.map(h => ({
                    level: i,
                    text: h.textContent?.trim().substring(0, 100) || '',
                    id: h.id || null,
                })));
            }
            
            // Get all form inputs
            const formInputs = Array.from(document.querySelectorAll('input, select, textarea')).map(input => {
                const label = input.labels && input.labels.length > 0 
                    ? input.labels[0].textContent?.trim() 
                    : (input.getAttribute('aria-label') || input.getAttribute('placeholder') || null);
                
                return {
                    type: input.type || input.tagName.toLowerCase(),
                    id: input.id || null,
                    name: input.name || null,
                    label: label,
                    ariaLabel: input.getAttribute('aria-label') || null,
                    ariaLabelledBy: input.getAttribute('aria-labelledby') || null,
                    required: input.required || false,
                };
            });
            
            // Get all links
            const links = Array.from(document.querySelectorAll('a')).map(link => ({
                href: link.href || '#',
                text: link.textContent?.trim().substring(0, 100) || '',
                ariaLabel: link.getAttribute('aria-label') || null,
                isSkipLink: (link.href.includes('#') && /skip|main|content/i.test(link.textContent || '')) ||
                            /skip.*content|skip.*main/i.test(link.getAttribute('aria-label') || ''),
            }));
            
            // Check for ARIA landmarks
            const hasLandmarks = Array.from(document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav')).length > 0;
            
            // Get computed styles for color analysis
            const colorInfo = Array.from(document.querySelectorAll('*')).slice(0, 100).map(el => {
                const style = window.getComputedStyle(el);
                return {
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    text: el.textContent?.trim().substring(0, 50) || '',
                };
            }).filter(info => info.text.length > 0);
            
            // Check for animations
            const animations = Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.animation !== 'none' || style.transition !== 'all 0s ease 0s';
            }).length;
            
            // Check for timers (setTimeout/setInterval - approximate detection)
            const scripts = Array.from(document.querySelectorAll('script')).map(script => 
                script.textContent || ''
            ).join(' ');
            
            const hasTimers = /setTimeout|setInterval/i.test(scripts);
            
            // Check for auto-advance content
            const hasAutoAdvance = /autoplay|auto.*play|carousel|slideshow/i.test(scripts);
            
            return {
                interactiveElements,
                images,
                headings,
                formInputs,
                links,
                colorInfo,
                animations,
                hasTimers,
                hasAutoAdvance,
                title: document.title,
                bodyText: document.body.textContent?.substring(0, 5000) || '',
                hasLandmarks,
            };
        }""")
        
        # Get CSS for color contrast analysis
        styles = page.evaluate("""() => {
            const sheets = Array.from(document.styleSheets);
            let cssText = '';
            sheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    rules.forEach(rule => {
                        cssText += rule.cssText + '\\n';
                    });
                } catch (e) {
                    // Cross-origin stylesheets may throw errors
                }
            });
            return cssText;
        }""")
        
        return {
            "html": html,
            "accessibilityTree": accessibility_tree,
            "pageData": page_data,
            "styles": styles,
            "url": url,
        }
        
    except Exception as error:
        raise Exception(f"Failed to analyze webpage: {str(error)}")
    finally:
        # Ensure page is always closed
        try:
            if not page.is_closed():
                page.close()
        except Exception as error:
            pass  # Silently ignore close errors

async def analyze_webpage(url: str):
    """
    Analyze a webpage and extract accessibility data (async wrapper).
    Runs the synchronous Playwright code in a thread pool to avoid Windows asyncio issues.
    
    Args:
        url: URL of the webpage to analyze
        
    Returns:
        Dictionary containing HTML, accessibility tree, page data, and styles
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _analyze_webpage_sync, url)
