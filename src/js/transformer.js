import { select } from '@wordpress/data';

const getTransformations = () => {
  const dedup = new Set();
  return select('core/blocks')
    .getBlockTypes()
    .filter((x) => x.transforms)
    .reduce((t, { name, transforms }) => {
      return [
        ...t,
        ...(transforms.from
          ? transforms.from
              .filter((x) => x.blocks)
              .reduce(
                (t, { transform, __experimentalConvert, isMultiBlock, isMatch, blocks }) => [
                  ...t,
                  ...blocks.map((b) => ({
                    from: b,
                    to: name,
                    transform: transform || __experimentalConvert,
                    experimental: !transform && !!__experimentalConvert,
                    isMatch,
                    isMultiBlock,
                  })),
                ],
                [],
              )
          : []),
        ...(transforms.to
          ? transforms.to
              .filter((x) => x.blocks)
              .reduce(
                (t, { transform, __experimentalConvert, isMultiBlock, isMatch, blocks }) => [
                  ...t,
                  ...blocks.map((b) => ({
                    from: name,
                    to: b,
                    transform: transform || __experimentalConvert,
                    experimental: !transform && !!__experimentalConvert,
                    isMatch,
                    isMultiBlock,
                  })),
                ],
                [],
              )
          : []),
      ];
    }, [])
    .filter((x) => x.transform)
    .filter(({ to, from }) => !dedup.has(`${to},${from}`) && dedup.add(`${to},${from}`));
};
const search = (lookupMap, from, to) => {
  const queue = [];
  const alreadyFound = new Set();
  const enqueue = (node, parents = []) => {
    if (!alreadyFound.has(node)) {
      alreadyFound.add(node);
      queue.push(node);
      node.parents = parents;
      queue.sort(({ experimental: a }, { experimental: b }) => (a ? 1 : b ? -1 : 0));
    }
  };

  lookupMap[from]?.forEach((n) => enqueue(n));
  lookupMap['*']?.forEach((n) => enqueue(n));
  while (queue.length > 0) {
    const node = queue.shift();
    if (node.to === to) {
      return [...node.parents, node];
    }

    lookupMap[node.to]?.forEach((n) => enqueue(n, [...node.parents, node]));
  }
};

export const transformationSearch = (from, to) => {
  const transformations = getTransformations();
  const lookupMap = {};
  transformations.forEach((t) => {
    if (!lookupMap[t.from]) lookupMap[t.from] = [];
    lookupMap[t.from].push(t);
  });

  return search(lookupMap, from, to);
};
