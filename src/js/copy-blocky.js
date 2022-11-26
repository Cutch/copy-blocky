import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { pasteCopiedBlocks } from './paste';
import { isKeyboardEvent } from '@wordpress/keycodes';
import './store';
import './menu-item';

/**
 * Store copied blocks in redux
 */
const copySelectedBlocks = () => {
  const { getBlock, getSelectedBlockClientIds } = select('core/block-editor');
  const { setCopiedBlocks } = dispatch('copy-blocky/data');
  const blockIds = getSelectedBlockClientIds();
  setCopiedBlocks(blockIds.map((blockId) => getBlock(blockId)));
};

/**
 * Create a copy listener for storing the blocks, and a paste listener
 */
const copyBlocky = () => {
  useEffect(() => {
    const pasteEvent = (e) => {
      const eventModifier = Object.keys(isKeyboardEvent).find((eventModifier) => isKeyboardEvent[eventModifier](e, e.key));
      if (eventModifier == window.copyBlocky.hotkeyModifier && e.key === window.copyBlocky.hotkeyKey) {
        pasteCopiedBlocks();
        e.preventDefault();
      }
    };
    document.addEventListener('copy', copySelectedBlocks);
    document.addEventListener('keydown', pasteEvent);
    const shortcutName = __('Paste Styles', 'copy-blocky');
    const description = __('Paste the styles of a copied block', 'copy-blocky');
    const { registerShortcut, unregisterShortcut } = dispatch('core/keyboard-shortcuts');
    registerShortcut({
      name: shortcutName,
      category: 'block',
      description,
      keyCombination: { modifier: window.copyBlocky.hotkeyModifier, character: window.copyBlocky.hotkeyKey },
    });
    return () => {
      unregisterShortcut(shortcutName);
      document.removeEventListener('copy', copySelectedBlocks);
      document.removeEventListener('keydown', pasteEvent);
    };
  }, []);
  return null;
};

registerPlugin('copy-blocky', {
  render: copyBlocky,
});
