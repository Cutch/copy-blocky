import { dispatch, select } from '@wordpress/data';
import { getBlockContent } from '@wordpress/blocks';
import { transformationSearch } from './transformer';
const debugging = false;
/**
 * Using the templated block determine attributes which should not be copied, ex. the content
 */
const getInvalidKeys = (block) => {
  const { getBlockType } = select('core/blocks');
  const copyBlockType = getBlockType(block.name);
  const validKeys = Object.keys(copyBlockType.attributes).filter((x) => copyBlockType.attributes[x]?.source !== 'html');
  return Object.keys(block.attributes).filter((x) => !validKeys.includes(x));
};

/**
 * Determine how the blocks should be copied.
 * This may be just the attributes, ex. if the block types are the same
 * If different block types try and use a transformation method
 * If There is no available transformation, try a generic attribute copy
 */
const updateAndMergeBlock = (blockId, copyBlock, pasteBlock) => {
  const { getBlockType } = select('core/blocks');
  const { getBlockParents, getBlock } = select('core/block-editor');
  const { replaceBlock, updateBlock } = dispatch('core/block-editor');
  let invalidKeys = getInvalidKeys(copyBlock);

  if (pasteBlock.name === copyBlock.name) {
    // If this is the same block copy attributes
    if (debugging) console.log(copyBlock);
    const attributes = { ...copyBlock.attributes };
    // Remove invalid attributes
    for (const key of invalidKeys) {
      delete attributes[key];
    }
    if (debugging) console.log(attributes, invalidKeys);
    // Set the block attributes
    updateBlock(blockId, { attributes });
  } else {
    // Check for parents if this block cant be transformed
    let transformers = transformationSearch(pasteBlock.name, copyBlock.name);
    let copyBlockType = getBlockType(copyBlock.name);
    while (!transformers && copyBlockType.parent) {
      const parents = getBlockParents(copyBlock.clientId);
      if (debugging) console.log(copyBlock);
      if (parents.length === 0) break; // Shouldn't happen, unless block is invalid
      copyBlock = getBlock(parents[parents.length - 1]);
      if (debugging) console.log('parents', copyBlock, parents);
      transformers = transformationSearch(pasteBlock.name, copyBlock.name);
      copyBlockType = getBlockType(copyBlock.name);
      invalidKeys = getInvalidKeys(copyBlock);
    }
    if (debugging) console.log('invalidKeys', invalidKeys);
    if (debugging) console.log(pasteBlock.name, copyBlock.name, transformers);

    // There is a valid tranformation path
    if (transformers) {
      if (debugging) console.log(copyBlock);
      let block = pasteBlock;
      // TODO: may need to add isMatch to the transformationSearch and filter out transforms which wouldn't work
      for (const { transform, isMultiBlock, isMatch, experimental } of transformers) {
        if (experimental) {
          block = transform([block]);
        } else if (isMultiBlock) {
          block = transform([block.attributes ?? {}], [block.innerBlocks ?? []]);
        } else {
          block = transform(block.attributes ?? {}, block.innerBlocks ?? []);
        }
      }
      const attributes = { ...copyBlock.attributes };
      // Remove invalid attributes
      for (const key of invalidKeys) {
        delete attributes[key];
      }
      block.attributes = { ...block.attributes, ...attributes };
      // replace the current block with the transformed block
      replaceBlock(blockId, block);
    } else {
      if (debugging) console.log('No Transformer');
      if (debugging) console.log(copyBlock);
      /* const content = getBlockContent(pasteBlock); */

      // Copy the attribute to the new block
      const attributes = { ...copyBlock.attributes };
      const oldAttributes = { ...pasteBlock.attributes };
      // Remove invalid attributes
      for (const key of invalidKeys) {
        delete oldAttributes[key];
      }
      // Set the new block type and attributes
      updateBlock(blockId, { attributes: { ...oldAttributes, ...attributes }, name: copyBlock.name });
      if (debugging) console.log({ attributes: { ...oldAttributes, ...attributes } });
    }
  }
};

/**
 * Start the paste procedure, this may be one or more blocks depending on what was copied and what is selected for pasting
 */
export const pasteCopiedBlocks = () => {
  const { getCopiedBlocks } = select('copy-blocky/data');
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
