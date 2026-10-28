/**
 * Accessible time-tool tabs. Calculator conversion is called only after all scripts load.
 */

const tabs = [getElement('world-tab'), getElement('calculator-tab'), getElement('list-tab')];
function showTab(index) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', i === index);
    tab.tabIndex = i === index ? 0 : -1;
    getElement(tab.getAttribute('aria-controls')).hidden = i !== index;
  });
  if (index === 1) convert();
  window.dispatchEvent(new CustomEvent('meridian-tab', {
    detail: {
      index
    }
  }));
}
tabs.forEach((tab, i) => {
  tab.onclick = () => showTab(i);
  tab.onkeydown = e => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      showTab(next);
      tabs[next].focus();
    }
  };
});
