import { registerPlugin } from '@wordpress/plugins';
import { PluginBlockSettingsMenuItem } from '@wordpress/edit-post';
import { pasteCopiedBlocks } from './paste';
import { replace } from '@wordpress/icons';

const CopyPasteStylesMenuPluggin = () => <PluginBlockSettingsMenuItem icon={replace} label="Paste Styles" onClick={pasteCopiedBlocks} />;

registerPlugin('copy-paste-styles-menu-item', {
  render: CopyPasteStylesMenuPluggin,
});
