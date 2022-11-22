import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import './store';
import './menu-item';
import { pasteCopiedBlocks } from './paste';

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
// const PasteStylesToolbar = (settings) => {
//   const BlockEdit = settings.edit;
//   return {
//     ...settings,
//     edit: (props) => {
//       console.log(props);
//       if (props.name === 'core/image') {
//         return <BlockEdit {...props} />;
//       }

//       return (
//         <>
//           <BlockControls>
//             <ToolbarButton icon={replace} label="Paste Styles" shortcut="ctrl+shift+v" onClick={pasteCopiedBlocks} />
//           </BlockControls>
//           <BlockEdit {...props} />
//         </>
//       );
//     },
//   };
// };

// addFilter('blocks.registerBlockType', 'csp/copy-paste-styles', PasteStylesToolbar);

registerPlugin('copy-paste-styles', {
  render: CopyPasteStyles,
});
// wp.hooks.addFilter('editor.BlockEdit', 'edit', (args) => {
//   console.log(args);
//   return args;
// });
