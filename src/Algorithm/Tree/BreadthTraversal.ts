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

function traverse2(tree) {
  const stack = [];
  stack.push(tree);
  while (stack.length) {
    const current = stack.shift();
    console.log(current.value);
    if (current.children)
      current.children.forEach(te => {
        stack.push(te);
      });
  }
}

traverse2(treeData);
