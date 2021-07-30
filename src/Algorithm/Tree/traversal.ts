const treeData = {
  value: 0,
  left: {
    value: 1,
    left: {
      value: 3,
    },
    right: {
      value: 4,
    },
  },
  right: {
    value: 2,
  },
};

function preTraverse(tree) {
  if (!tree) return;
  console.log(tree.value);
  preTraverse(tree.left);
  preTraverse(tree.right);
}

function preTraverseStack(root) {
  const res = [];
  const stack = [];
  if (root) stack.push(root);
  while (stack.length) {
    const n = stack.pop();
    res.push(n.value);
    const { left, right } = n;
    if (right) stack.push(right);
    if (left) stack.push(left);
  }
  return res;
}
console.log('---前序遍历---');
console.log(preTraverse(treeData));
console.log(preTraverseStack(treeData));

function inTraverse(tree) {
  if (!tree) return;
  inTraverse(tree.left);
  console.log(tree.value);
  inTraverse(tree.right);
}

function inTraverseStack(tree) {
  let p = tree;
  const arr = [];
  const res = [];
  while (p || arr.length !== 0) {
    if (p) {
      arr.push(p);
      p = p.left;
    } else {
      let node = arr.pop();
      res.push(node.value);
      p = node.right;
    }
  }
  return res;
}

console.log('---中序遍历---');
console.log(inTraverse(treeData));
console.log(inTraverseStack(treeData));

function postTraverse(tree) {
  if (!tree) return;
  postTraverse(tree.left);
  postTraverse(tree.right);
  console.log(tree.value);
}

function postTraverseStack(tree) {
  const arr = [tree];
  const res = [];
  while (arr.length !== 0) {
    let node = arr.pop();
    res.push(node.value);
    if (node.left) arr.push(node.left);
    if (node.right) arr.push(node.right);
  }
  return res.reverse();
}

console.log('---后序遍历---');
console.log(postTraverse(treeData));
console.log(postTraverseStack(treeData));
