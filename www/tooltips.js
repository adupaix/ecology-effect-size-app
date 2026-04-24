// www/tooltips.js — Bootstrap 5 tooltip initialisation
// ============================================================
// Tooltips are attached to clickable question-mark icons (tooltip-icon class).
// Each icon carries data-bs-trigger="click" so the tooltip opens/closes on
// click rather than hover.  Clicking anywhere outside an open tooltip
// dismisses it.
//
// Popovers are handled natively by bslib::popover() — no JS needed here.

// Initialise all Bootstrap tooltips present in the DOM
function initTooltips() {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach(function (el) {
    // Avoid double-initialisation
    if (!bootstrap.Tooltip.getInstance(el)) {
      new bootstrap.Tooltip(el, {
        container: 'body',
        boundary: document.body,
        fallbackPlacements: ['bottom', 'right', 'left', 'top']
      });
    }
  });
}

// Dismiss any open click-triggered tooltip when the user clicks outside
document.addEventListener('click', function (e) {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    var instance = bootstrap.Tooltip.getInstance(el);
    if (instance && !el.contains(e.target)) {
      instance.hide();
    }
  });
}, true);

// Run on initial page load
document.addEventListener('DOMContentLoaded', function () {
  initTooltips();
});

// Re-run after Shiny re-renders dynamic UI (debounced to prevent excessive calls)
var _tooltipTimer = null;
$(document).on('shiny:value', function () {
  if (_tooltipTimer) clearTimeout(_tooltipTimer);
  _tooltipTimer = setTimeout(initTooltips, 500);
});

// Allow server to trigger re-initialisation explicitly
Shiny.addCustomMessageHandler('reinit_tooltips', function (msg) {
  initTooltips();
});

// Prevent mouse-wheel changes on numeric inputs while scrolling through
// large Shiny forms like the effect-size panel. Without this, hovering a
// numericInput can change its value instead of scrolling the page, which
// makes the review pane feel jumpy and unstable.
if (!window.__numericWheelGuardBound) {
  document.addEventListener('wheel', function (e) {
    var el = e.target;
    if (el && el.matches && el.matches('input[type="number"]')) {
      el.blur();
    }
  }, { capture: true, passive: true });

  window.__numericWheelGuardBound = true;
}

// Keep resizable review popovers anchored correctly after the user drags
// the resize handle on the popover body.
if (!window.__reviewPopoverResizeBound) {
  var reviewPopoverObserver = new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      var body = entry.target;
      var triggerId = body.getAttribute('data-popover-trigger-id');
      if (!triggerId) return;

      var trigger = document.getElementById(triggerId);
      if (!trigger) return;

      var instance = bootstrap.Popover.getInstance(trigger);
      if (instance) {
        instance.update();
      }
    });
  });

  document.addEventListener('shown.bs.popover', function (e) {
    var trigger = e.target;
    var popoverId = trigger.getAttribute('aria-describedby');
    if (!popoverId) return;

    var popover = document.getElementById(popoverId);
    if (!popover || !popover.classList.contains('review-help-popover')) return;

    if (!trigger.id) {
      trigger.id = 'review-help-trigger-' + Math.random().toString(36).slice(2, 10);
    }

    var body = popover.querySelector('.popover-body');
    if (!body) return;

    body.setAttribute('data-popover-trigger-id', trigger.id);
    reviewPopoverObserver.observe(body);
  });

  document.addEventListener('hidden.bs.popover', function (e) {
    var trigger = e.target;
    var popoverId = trigger.getAttribute('aria-describedby');
    if (!popoverId) return;

    var popover = document.getElementById(popoverId);
    if (!popover) return;

    var body = popover.querySelector('.popover-body');
    if (!body) return;

    reviewPopoverObserver.unobserve(body);
    body.removeAttribute('data-popover-trigger-id');
  });

  window.__reviewPopoverResizeBound = true;
}
