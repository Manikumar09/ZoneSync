/**
 * Theme menu, keyboard navigation, and saved appearance preferences.
 */

(() => {
  const trigger = document.getElementById('theme-menu-button'),
    menu = document.getElementById('theme-menu');
  const choices = [...menu.querySelectorAll('[data-theme-choice]')];
  function close(focus = false) {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus();
  }
  function apply(value) {
    if (!['mono', 'bright', 'midnight'].includes(value)) return;
    document.documentElement.dataset.theme = value;
    for (const choice of choices) choice.setAttribute('aria-pressed', String(choice.dataset.themeChoice === value));
    try {
      localStorage.setItem('meridian-theme', value);
    } catch {}
  }
  trigger.onclick = () => {
    const open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) choices.find(c => c.getAttribute('aria-pressed') === 'true')?.focus();
  };
  choices.forEach(choice => choice.onclick = () => {
    apply(choice.dataset.themeChoice);
    close(true);
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const current = choices.indexOf(document.activeElement);
      choices[event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length].focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.theme-menu-wrap')) close();
  });
  document.addEventListener('focusin', event => {
    if (!menu.hidden && !event.target.closest('.theme-menu-wrap')) close();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'meridian-theme') apply(event.newValue || 'midnight');
  });
  apply(document.documentElement.dataset.theme || 'midnight');
})();
