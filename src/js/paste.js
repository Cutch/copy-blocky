import { dispatch, select } from '@wordpress/data';
import { getBlockContent } from '@wordpress/blocks';
import { transformationSearch } from './transformer';

window.copyBlocky = { ...(window.copyBlocky ?? {}), debugging: false };

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
    if (window.copyBlocky.debugging) console.log('Blocks are the same type');
    if (window.copyBlocky.debugging) console.log('copyBlock', copyBlock);

    const attributes = { ...copyBlock.attributes };
    // Remove invalid attributes
    for (const key of invalidKeys) {
      delete attributes[key];
    }
    if (window.copyBlocky.debugging) console.log({ attributes, invalidKeys });
    // Set the block attributes
    updateBlock(blockId, { attributes });
  } else {
    // Check for parents if this block cant be transformed
    let transformers = transformationSearch(pasteBlock.name, copyBlock.name);
    let copyBlockType = getBlockType(copyBlock.name);
    let pasteBlockType = getBlockType(copyBlock.name);
    while (!transformers && (copyBlockType.parent || pasteBlockType.parent)) {
      if (window.copyBlocky.debugging) console.log('No transformer found, checking for parent blocks');

      // TODO: Theoretically, the current block could match to the parent of the other or vice versa, in practice this shouldn't matter, at least for built in blocks

      // Check if the copy block has a parent
      let parents = getBlockParents(copyBlock.clientId);
      if (window.copyBlocky.debugging) console.log('copyBlock', copyBlock);
      if (parents.length === 0) break; // Shouldn't happen, unless block is invalid
      copyBlock = getBlock(parents[parents.length - 1]);
      if (window.copyBlocky.debugging) console.log('copyBlock parent', copyBlock, parents);
      copyBlockType = getBlockType(copyBlock.name);

      // Check if the paste block has a parent
      parents = getBlockParents(pasteBlock.clientId);
      if (window.copyBlocky.debugging) console.log('pasteBlock', pasteBlock);
      if (parents.length === 0) break; // Shouldn't happen, unless block is invalid
      pasteBlock = getBlock(parents[parents.length - 1]);
      if (window.copyBlocky.debugging) console.log('pasteBlock parent', copyBlock, parents);
      pasteBlockType = getBlockType(pasteBlock.name);

      // Check if transformer exists for this block set
      transformers = transformationSearch(pasteBlock.name, copyBlock.name);
      invalidKeys = getInvalidKeys(copyBlock);
    }

    if (window.copyBlocky.debugging) console.log('invalidKeys', invalidKeys);
    // There is a valid tranformation path
    if (transformers) {
      if (window.copyBlocky.debugging) console.log(`Transformer Found for ${pasteBlock.name} -> ${copyBlock.name}`, transformers);
      if (window.copyBlocky.debugging) console.log('pasteBlock', pasteBlock);
      if (window.copyBlocky.debugging) console.log('copyBlock', copyBlock);

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
      if (Array.isArray(block))
        block.forEach((b) => {
          b.attributes = { ...b.attributes, ...attributes };
        });
      else block.attributes = { ...block.attributes, ...attributes };
      if (window.copyBlocky.debugging) console.log('New Block', block);
      // replace the current block with the transformed block
      replaceBlock(blockId, block);
    } else {
      if (window.copyBlocky.debugging) console.log('No Transformer');
      if (window.copyBlocky.debugging) console.log('pasteBlock', pasteBlock);
      if (window.copyBlocky.debugging) console.log('copyBlock', copyBlock);
      /* const content = getBlockContent(pasteBlock); */

      // TODO: Better content copying, ex. list to button

      // Copy the attribute to the new block
      const attributes = { ...copyBlock.attributes };
      const oldAttributes = { ...pasteBlock.attributes };
      // Remove invalid attributes
      for (const key of invalidKeys) {
        delete attributes[key];
      }
      // Set the new block type and attributes
      updateBlock(blockId, { attributes: { ...oldAttributes, ...attributes }, name: copyBlock.name });
      if (window.copyBlocky.debugging) console.log('New Attributes', { attributes: { ...oldAttributes, ...attributes } });
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
