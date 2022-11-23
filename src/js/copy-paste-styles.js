import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { pasteCopiedBlocks } from './paste';
import './store';
import './menu-item';

const copySelectedBlocks = () => {
  const { getBlock, getSelectedBlockClientIds } = select('core/block-editor');
  const { setCopiedBlocks } = dispatch('cps/data');
  const blockIds = getSelectedBlockClientIds();
  setCopiedBlocks(blockIds.map((blockId) => getBlock(blockId)));
};
const CopyPasteStyles = () => {
  useEffect(() => {
    const pasteEvent = (e) => {
      if (e.shiftKey && e.ctrlKey && e.key === 'V') {
        pasteCopiedBlocks();
        e.preventDefault();
      }
    };
    document.addEventListener('copy', copySelectedBlocks);
    document.addEventListener('keydown', pasteEvent);
    return () => {
      document.removeEventListener('copy', copySelectedBlocks);
      document.removeEventListener('keydown', pasteEvent);
    };
  }, []);
  return null;
};

registerPlugin('copy-paste-styles', {
  render: CopyPasteStyles,
});
// wp.hooks.addFilter('editor.BlockEdit', 'edit', (args) => {
//   console.log(args);
//   return args;
// });
