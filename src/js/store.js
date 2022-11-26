import { createReduxStore, register } from '@wordpress/data';
const initialState = {
  copiedBlocks: [],
};

const actions = {
  setCopiedBlocks(copiedBlocks) {
    return {
      type: 'SET_COPIED_BLOCKS',
      copiedBlocks,
    };
  },
};

/**
 * Create a store to save copied blocks to
 */
const store = createReduxStore('copy-blocky/data', {
  reducer(state = initialState, action) {
    switch (action.type) {
      case 'SET_COPIED_BLOCKS':
        return {
          ...state,
          copiedBlocks: action.copiedBlocks,
        };
    }

    return state;
  },

  actions,

  selectors: {
    getCopiedBlocks(state, item) {
      const { copiedBlocks } = state;

      return copiedBlocks;
    },
  },
});

register(store);
