const firstHeap = document.getElementById('heap');
const takeButton = document.getElementById('take-button');
const result = document.getElementById('result');
const playerSelector = document.getElementsByName('group1');
const imagePath = './img/chip.png';
const MAX_REMOVE_COUNT = 3;
const CHIP_COUNT = 15;

class Heap {
  constructor(n, container) {
    this.chips = [];
    this.container = container;

    for (let i = 0; i < n; i++) {
      this.chips.push(new Chip(imagePath, container))
    }
  }

  removeSelected() {
    const elementsToRemove = [];
    for (const element of document.getElementsByClassName('selected-chip')) {
      elementsToRemove.push(element);
    }

    for (const element of elementsToRemove) {
      this.container.removeChild(element);
    }
    return elementsToRemove.length;
  }

  removeCount(n) {
    const elementsToRemove = [];

    for (const element of document.getElementsByClassName('chip')) {
      if (n-- > 0) {
        elementsToRemove.push(element);
      }
    }

    for (const element of elementsToRemove) {
      this.container.removeChild(element);
    }
  }
}

class Chip {
  constructor(imagePath, container) {
    this.selected = false;
    this.container = container;
    this.element = document.createElement('img');
    this.element.src = imagePath;
    this.element.className = 'chip';
    this.element.alt = 'game chip';
    this.element.onclick = this.handleClick.bind(this);
    this.container.appendChild(this.element);
  }

  handleClick() {
    const selected = document.getElementsByClassName('selected-chip');
    if (selected.length === MAX_REMOVE_COUNT && !this.selected) {
      return;
    }
    this.selected = !this.selected;
    this.element.className = this.selected ? 'selected-chip' : 'chip';
  }
}

class GameState {
  constructor(chipCount, player, prevState) {
    this.chipCount = chipCount;
    this.currentPlayer = player;
    this.prevState = prevState;
    this.childStates = [];
    this.score = undefined;
  }

  addChild(state) {
    this.childStates.push(state);
  }
}

const treeBuilder = leaves => {
  const buildTree = state => {
    if (state.chipCount === 0) {
      state.score = state.currentPlayer === 'MAX' ? 1 : -1;
      leaves.push(state);
    }

    for (let i = state.chipCount - 1; i >= Math.max(state.chipCount - MAX_REMOVE_COUNT, 0); i--) {
      const nextPlayer = state.currentPlayer === 'MAX' ? 'MIN' : 'MAX';
      const childState = new GameState(i, nextPlayer, state);
      state.addChild(childState);
      buildTree(childState);
    }
  };
  return buildTree;
}

const evalTree = leaf => {
  if (!leaf.score) {
    for (const child of leaf.childStates) {
      if (!child.score) return;
    }

    let bestScore;
    let compare;

    if (leaf.currentPlayer === 'MAX') {
      bestScore = -Infinity;
      compare = Math.max;
    } else {
      bestScore = Infinity;
      compare = Math.min;
    }

    for (const child of leaf.childStates) {
      bestScore = compare(bestScore, child.score);
    }

    leaf.score = bestScore;
  }

  if (leaf.prevState) {
    evalTree(leaf.prevState);
  }
};

const printTree = state => {
  console.log(state);
  state.childStates.forEach(s => {
    printTree(s);
  })
};

const botTurn = (state, heap) => {
  const leaves = [];
  const build = treeBuilder(leaves);
  build(state);
  leaves.forEach(leaf => evalTree(leaf));

  const nextState = state.childStates.reduce((prev, cur) => {
    if (state.currentPlayer === 'MAX') {
      return prev.score > cur.score ? prev : cur;
    } else {
      return prev.score < cur.score ? prev : cur;
    }
  });

  console.log(nextState);
  console.log(state.chipCount - nextState.chipCount);
  heap.removeCount(state.chipCount - nextState.chipCount);
  const nextPlayer = currentState.currentPlayer === 'MAX' ? 'MIN' : 'MAX';
  currentState = new GameState(nextState.chipCount, nextPlayer, null);
  if (currentState.chipCount === 0) {
    result.innerHTML = '<h1>You won!</h1>';
  }
};

const heap = new Heap(CHIP_COUNT, firstHeap);
let currentState = new GameState(CHIP_COUNT, 'MAX', null);
if (!playerSelector[0].checked) botTurn(currentState, heap);

takeButton.onclick = () => {
  const removed = heap.removeSelected();
  if (removed === 0) return;
  const nextPlayer = currentState.currentPlayer === 'MAX' ? 'MIN' : 'MAX';
  currentState = new GameState(currentState.chipCount - removed, nextPlayer, null);
  if (currentState.chipCount === 0) {
    result.innerHTML = '<h1>You lost!</h1>';
    return;
  }
  botTurn(currentState, heap);
};
