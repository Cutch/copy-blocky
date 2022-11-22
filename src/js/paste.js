import { dispatch, select } from '@wordpress/data';
import { getBlockContent } from '@wordpress/blocks';
const getBlockDataForMerging = (copyBlock, pasteBlock) => {
  const { getBlockType } = select('core/blocks');
  const copyBlockType = getBlockType(copyBlock.name);
  const pasteBlockType = getBlockType(pasteBlock.name);
  const validKeys = Object.keys(copyBlockType.attributes);
  const invalidKeys = Object.keys(pasteBlockType.attributes).filter((x) => validKeys.includes(x));
  getBlockContent(copyBlock);
  getBlockContent(pasteBlock);

  const attributes = { ...copyBlock.attributes };
  const oldAttributes = { ...pasteBlock.attributes };
  for (const key of invalidKeys) {
    delete oldAttributes[key];
  }
  // delete attributes.content;
  // if (pasteBlock.attributes.content) attributes.content = pasteBlock.attributes.content;
  // console.log(pasteBlock.attributes, attributes);
  return { attributes: { ...oldAttributes, ...attributes }, name: copyBlock.name };
};
export const pasteCopiedBlocks = () => {
  const { getCopiedBlocks } = select('cps/data');
  const copiedData = getCopiedBlocks();

  const { getBlock, getSelectedBlockClientIds } = select('core/block-editor');
  const { clearSelectedBlock, updateBlock } = dispatch('core/block-editor');
  if (copiedData.length == 0) return null;
  const oneBlockSelected = copiedData.length === 1;
  const pasteBlockIds = getSelectedBlockClientIds();
  if (pasteBlockIds) {
    if (oneBlockSelected) {
      // If only one copied block, apply it to all pasted blocks
      const copiedBlock = copiedData[0];
      pasteBlockIds.forEach((blockId) => {
        updateBlock(blockId, getBlockDataForMerging(copiedBlock, getBlock(blockId)));
      });
    } else {
      // For Each copied block attempt to align it with a block for pasting
      copiedData.forEach((copiedBlock, i) => {
        if (pasteBlockIds[i]) updateBlock(pasteBlockIds[i], getBlockDataForMerging(copiedBlock, getBlock(pasteBlockIds[i])));
      });
    }
    clearSelectedBlock();
  }
};
