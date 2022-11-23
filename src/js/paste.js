import { dispatch, select } from '@wordpress/data';
import { getBlockContent } from '@wordpress/blocks';
import { transformationSearch } from './transformer';

const updateAndMergeBlock = (blockId, copyBlock, pasteBlock) => {
  const { getBlockType } = select('core/blocks');
  const { replaceBlock, updateBlock, updateBlockAttributes } = dispatch('core/block-editor');
  const copyBlockType = getBlockType(copyBlock.name);
  // const pasteBlockType = getBlockType(pasteBlock.name);
  const validKeys = Object.keys(copyBlockType.attributes).filter((x) => copyBlockType.attributes[x]?.source !== 'html');
  const invalidKeys = Object.keys(copyBlock.attributes).filter((x) => !validKeys.includes(x));
  console.log('validKeys', validKeys);
  console.log('invalidKeys', invalidKeys);
  // getBlockContent(copyBlock);
  // getBlockContent(pasteBlock);

  const transformers = transformationSearch(pasteBlock.name, copyBlock.name);
  console.log(pasteBlock.name, copyBlock.name, transformers);
  if (pasteBlock.name === copyBlock.name) {
    const attributes = { ...copyBlock.attributes };
    for (const key of invalidKeys) {
      delete attributes[key];
    }
    updateBlockAttributes(blockId, attributes);
  } else if (transformers) {
    let block = pasteBlock;
    for (const { transform, isMultiBlock, isMatch } of transformers) {
      if (isMultiBlock) block = transform([block.attributes], [block.innerBlocks]);
      else block = transform(block.attributes, block.innerBlocks);
    }
    const attributes = { ...copyBlock.attributes };
    for (const key of invalidKeys) {
      delete attributes[key];
    }
    block.attributes = { ...block.attributes, ...attributes };
    replaceBlock(blockId, block);
  } else {
    const content = getBlockContent(pasteBlock);
    const attributes = { ...copyBlock.attributes };
    const oldAttributes = { ...pasteBlock.attributes };
    for (const key of invalidKeys) {
      delete oldAttributes[key];
    }
    updateBlock(blockId, { attributes: { ...oldAttributes, ...attributes }, name: copyBlock.name });
  }
};
export const pasteCopiedBlocks = () => {
  const { getCopiedBlocks } = select('cps/data');
  const copiedData = getCopiedBlocks();

  const { getBlock, getSelectedBlockClientIds } = select('core/block-editor');
  const { clearSelectedBlock } = dispatch('core/block-editor');
  if (copiedData.length == 0) return null;
  const oneBlockSelected = copiedData.length === 1;
  const pasteBlockIds = getSelectedBlockClientIds();
  if (pasteBlockIds) {
    if (oneBlockSelected) {
      // If only one copied block, apply it to all pasted blocks
      const copiedBlock = copiedData[0];
      pasteBlockIds.forEach((blockId) => {
        updateAndMergeBlock(blockId, copiedBlock, getBlock(blockId));
      });
    } else {
      // For Each copied block attempt to align it with a block for pasting
      copiedData.forEach((copiedBlock, i) => {
        if (pasteBlockIds[i]) updateAndMergeBlock(pasteBlockIds[i], copiedBlock, getBlock(pasteBlockIds[i]));
      });
    }
    clearSelectedBlock();
  }
};
