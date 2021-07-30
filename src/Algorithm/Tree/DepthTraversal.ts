const treeData = {
  value: 0,
  children: [
    {
      value: 1,
      children: [
        {
          value: 3,
        },
        {
          value: 4,
        },
      ],
    },
    {
      value: 2,
    },
  ],
};

function traverse1(tree) {
  console.log(tree);
  if (tree.children) {
    tree.children.forEach(traverse1);
  }
}

traverse1(treeData);
