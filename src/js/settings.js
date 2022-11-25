import { isKeyboardEvent } from '@wordpress/keycodes';

document.getElementById('copy-paste-styles_setting_hotkey_modifier').parentNode.parentNode.style = 'display:none';
document.getElementById('copy-paste-styles_setting_hotkey_key').parentNode.parentNode.style = 'display:none';

const getKey = (e) => {
  const eventModifier = Object.keys(isKeyboardEvent).find((eventModifier) => isKeyboardEvent[eventModifier](e, e.key));

  if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift') return;
  const keyPath = [e.ctrlKey ? 'ctrl' : '', e.shiftKey ? 'shift' : '', e.altKey ? 'alt' : '', e.key].filter(function (x) {
    return x != '';
  });

  document.getElementById('copy-paste-styles_setting_hotkey').value = keyPath.join('+');
  document.getElementById('copy-paste-styles_setting_hotkey_modifier').value = eventModifier;
  document.getElementById('copy-paste-styles_setting_hotkey_key').value = e.key;

  document.getElementById('copy-paste-styles_setting_hotkey_error').innerText =
    keyPath.length == 1 ? 'It is recommended to include a modifier (such as ctrl, alt, shift) with your hotkey.' : '';

  e.preventDefault();
};
window.copyPasteStyles = { ...(window.copyPasteStyles ?? {}), getKey };
