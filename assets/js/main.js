/* ==========================================================================
   Age Bridge Initiative (ABI) - main.js
   1. Mobile navigation
   2. Contact form (opens an email, or posts to a form service)
   No libraries. No tracking.
   ========================================================================== */
(function () {
  'use strict';

  /* ----- Contact form settings: the only place to edit when switching to a form service ----- */
  var FORM_CONFIG = {
    // Where messages go when no form service is set (from the source document).
    email: 'mlkayisire@gmail.com',
    // To use a free form service (Formspree, Web3Forms, Getform, etc.),
    // paste its endpoint URL here, for example 'https://formspree.io/f/xxxxxxxx'.
    // Leave empty to keep using the pre-filled email.
    endpoint: '',
    subjectPrefix: 'ABI enquiry'
  };

  /* ----- 1. Mobile navigation ----- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('.nav-toggle__text').textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ----- 2. Contact form ----- */
  var form = document.getElementById('contact-form');
  if (!form) { return; }

  var status = document.getElementById('form-status');
  var roleField = form.elements['role'];

  // Links such as get-involved.html?role=mentor pre-select the "I am a" choice.
  try {
    var wanted = new URLSearchParams(window.location.search).get('role');
    if (wanted && roleField) {
      for (var i = 0; i < roleField.options.length; i++) {
        if (roleField.options[i].value.toLowerCase() === wanted.toLowerCase()) {
          roleField.selectedIndex = i;
        }
      }
    }
  } catch (err) { /* older browsers: ignore */ }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'form-status form-status--' + type;
  }

  function buildBody(data) {
    var lines = ['Name: ' + data.name, 'I am a: ' + data.role];
    if (data.email) { lines.push('Email: ' + data.email); }
    lines.push('', data.message);
    return lines.join('\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus('Please fill in the required fields.', 'error');
      return;
    }

    var data = {
      name: form.elements['name'].value.trim(),
      role: form.elements['role'].value,
      email: form.elements['email'] ? form.elements['email'].value.trim() : '',
      message: form.elements['message'].value.trim()
    };

    // Option A: a form service is configured, so send the data to it.
    if (FORM_CONFIG.endpoint) {
      showStatus('Sending…', 'ok');
      fetch(FORM_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (response) {
        if (!response.ok) { throw new Error('Request failed'); }
        form.reset();
        showStatus('Thank you. Your message has been sent.', 'ok');
      }).catch(function () {
        showStatus('Your message could not be sent. Please email ' + FORM_CONFIG.email + '.', 'error');
      });
      return;
    }

    // Option B (default): open the visitor's email app with a pre-filled message.
    var subject = FORM_CONFIG.subjectPrefix + ': ' + data.role;
    var href = 'mailto:' + FORM_CONFIG.email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(buildBody(data));
    showStatus('Your email app should open now. If it does not, write to ' + FORM_CONFIG.email + '.', 'ok');
    window.location.href = href;
  });
})();
