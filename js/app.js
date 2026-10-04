/* ==============================================================
   AOK Foundation — app.js
   Rewritten 2026. Changes vs. previous version:
   - Removed initializeMenu()/resize handler that re-bound click
     handlers on every resize and force-opened the drawer between
     768px and 1023px.
   - Single nav controller, keyboard accessible, ARIA wired.
   - Every plugin call guarded so one missing plugin can no longer
     abort the rest of the script.
   - Mouse-parallax disabled on touch and for reduced-motion users.
================================================================= */
(function ($) {
  'use strict';

  // Must match the 64em desktop breakpoint in app.min.css.
  var DESKTOP_BREAKPOINT = 1024;

  if ($.fn.foundation) { $(document).foundation(); }

  $(function () {
    initNav();            // first: nav must work even if a plugin fails
    initPreloader();
    initSwitcher();
    initParallaxFx();
    initCounters();
    initProgressBars();
    initLightboxGallery();
    initMailChimp();
  });

  // Utilities
  // ===================================
  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  // Navigation
  // ===================================
  function initNav() {
    var $icon = $('#menuIcon');
    var $nav = $('.menuInline');
    var $body = $('body');
    var scrollY = 0;

    if (!$icon.length || !$nav.length) { return; }

    if (!$nav.attr('id')) { $nav.attr('id', 'primaryNav'); }
    $nav.attr('role', 'navigation');

    $icon.attr({
      'role': 'button',
      'tabindex': '0',
      'aria-label': 'Open menu',
      'aria-expanded': 'false',
      'aria-controls': $nav.attr('id')
    });

    var $backdrop = $('<div class="navBackdrop"></div>').appendTo($body);

    function lockScroll() {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
      $body.css('top', (-scrollY) + 'px').addClass('nav-locked');
    }

    function unlockScroll() {
      $body.removeClass('nav-locked').css('top', '');
      window.scrollTo(0, scrollY);
    }

    function setOpen(open) {
      var wasOpen = $icon.hasClass('open');
      if (open === wasOpen) { return; }

      $icon.toggleClass('open', open).attr({
        'aria-expanded': open ? 'true' : 'false',
        'aria-label': open ? 'Close menu' : 'Open menu'
      });
      $body.toggleClass('nav-open', open);

      if (open) { lockScroll(); } else { unlockScroll(); }
    }

    // Click only. The previous 'click touchstart' pair fired twice on
    // browsers that do not suppress the synthetic click, and
    // preventDefault on touchstart blocked scrolls that began on the icon.
    $icon.on('click', function (e) {
      e.preventDefault();
      setOpen(!$icon.hasClass('open'));
    });

    $icon.on('keydown', function (e) {
      if (e.which === 13 || e.which === 32) {   // Enter / Space
        e.preventDefault();
        $(this).trigger('click');
      }
    });

    $backdrop.on('click', function () { setOpen(false); });

    $(document).on('keyup', function (e) {
      if (e.which === 27) { setOpen(false); }   // Escape
    });

    // Close the drawer after choosing a destination on mobile.
    $nav.on('click', 'a', function () {
      if (!isDesktop()) { setOpen(false); }
    });

    // Only reacts to a real breakpoint crossing. Mobile browsers fire
    // resize when the URL bar collapses or the keyboard opens, so this
    // must not touch state otherwise.
    var wasDesktop = isDesktop();
    $(window).on('resize orientationchange', debounce(function () {
      var nowDesktop = isDesktop();
      if (nowDesktop !== wasDesktop) {
        wasDesktop = nowDesktop;
        if (nowDesktop) { setOpen(false); }
      }
    }, 150));
  }

  // Page preloader
  // ===================================
  function initPreloader() {
    if ($.fn.fakeLoader) {
      $('.fakeloader').fakeLoader({
        timeToHide: 500,
        bgColor: '#ffffff',
        spinner: 'spinner2'
      });
    } else {
      $('.fakeloader').remove();
    }
    // Legacy full-screen white overlay. If it is ever reintroduced and
    // JS fails to load, the whole page renders blank — remove on sight.
    $('.flbackdrop').remove();
  }

  // Style switcher (demo leftover; harmless if the markup is absent)
  // ===================================
  function initSwitcher() {
    $('#switcherIcon').on('click', function () { $('#switcher').toggleClass('open'); });
    $('#buyIcon').on('click', function () { $('#buy').toggleClass('open'); });
  }

  // Parallax elements
  // ===================================
  function initParallaxFx() {
    if (!$.fn.panr) { return; }

    var noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // panr tracks the mouse. On touch devices it costs CPU and battery
    // for an effect nobody can trigger.
    if (noHover || reduced) { return; }

    $('.parallaxElem').panr({
      moveTarget: $(document),
      sensitivity: 15,
      scale: false,
      panY: true,
      panX: true,
      panDuration: 1.25,
      resetPanOnMouseLeave: true
    });
  }

  // Counters
  // ===================================
  function initCounters() {
    if (!$.fn.appear || !$.fn.countTo) { return; }
    $('.timer').appear(function () { $(this).countTo(); });
  }

  // Progress bars
  // ===================================
  function initProgressBars() {
    if (!$.fn.appear) { return; }
    $('.pro-bar').each(function (i, elem) {
      var $elem = $(this),
        percent = $elem.attr('data-pro-bar-percent'),
        delay = $elem.attr('data-pro-bar-delay');

      if (!$elem.hasClass('animated')) { $elem.css({ width: '0%' }); }

      $(elem).appear(function () {
        setTimeout(function () {
          $elem.animate({ width: percent + '%' }, 2000, 'easeInOutExpo').addClass('animated');
        }, delay);
      });
    });
  }

  // Lightbox gallery
  // ===================================
  function initLightboxGallery() {
    if (!$.fn.magnificPopup) { return; }
    $('.lightboxGallery').magnificPopup({
      delegate: 'a',
      type: 'image',
      closeOnContentClick: false,
      mainClass: 'mfp-with-zoom mfp-img-mobile',
      fixedContentPos: true,
      overflowY: 'hidden',
      closeBtnInside: false,
      image: {
        verticalFit: true,
        titleSrc: function (item) { return item.el.attr('title'); }
      },
      gallery: { enabled: true, navigateByImgClick: true },
      zoom: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        opener: function (element) { return element.find('img'); }
      }
    });
  }

  // MailChimp
  // ===================================
  function initMailChimp() {
    if (!$.fn.ajaxChimp || !$('#mc_form').length) { return; }

    $('#mc_form').ajaxChimp({ language: 'pix' });

    $.ajaxChimp.translations.pix = {
      'submit': 'Submitting...',
      0: '<i class="icon-check"></i> Thank you! We have sent you a confirmation email!',
      1: '<i class="icon-cross"></i> You must enter a valid e-mail address.',
      2: '<i class="icon-cross"></i> E-mail address is not valid.',
      3: '<i class="icon-cross"></i> E-mail address is not valid.',
      4: '<i class="icon-cross"></i> E-mail address is not valid.',
      5: '<i class="icon-cross"></i> E-mail address is not valid.'
    };
  }

})(jQuery);
