class RenderHook {
  constructor(getElement) {
    this._getElement = getElement;
    this._modifier = null;
    window.addEventListener("load", () => this.render());
  }

  use(state) {
    state.addEventListener("update", (e) => {
      this.render();
    });
    return this;
  }

  modify(modifier) {
    this._modifier = modifier;
    return this;
  }

  render() {
    const theElement = this._getElement();
    if (!theElement) return;
    if (typeof this._modifier === "function") this._modifier(theElement);
  }
}

class StateHook extends EventTarget {
  #_value = null;
  constructor(value) {
    super();
    this.#_value = value;
  }

  get value() {
    return this.#_value;
  }

  set value(newValue) {
    return null;
  }
  show() {
    return this.#_value;
  }

  update(newValue) {
    this.#_value = newValue;
    const updateEvent = new CustomEvent("update");
    this.dispatchEvent(updateEvent);
  }
}

const state = new StateHook(0, 'Loading...');

new RenderHook(() => document.getElementById("root"))
  .use(state)
  .modify((el) => {
    // console.log('state.value: ', state.value)
    el.innerHTML = ""

    loopElement(el, state.value.navBar)
    loopElement(el, state.value.body)
    loopElement(el, state.value.footer)
  });

//  build elements from json array for web page
const loopElement = (el, elemntsArray) => {
  console.log('array ', elemntsArray)
  elemntsArray.map(row => {
    const newbie = createNewElement(el, row)
    // this is reading json values only in 3 levels deep. Some better solution to find one day...
    if (row.children) {
      row.children.map(row2 => {
        const newbie2 = createNewElement(newbie, row2)
        if (row2.children) {
          row2.children.map(row3 => {
            const newbie3 = createNewElement(newbie2, row3)
            if (row3.children) {
              row3.children.map(row4 => {
                createNewElement(newbie3, row4)
              })
            }
          })
        }
      })
    }
  })
}

// create html element form json item
const createNewElement = (el, row) => {
  const newElement = document.createElement(row.element);
  row.content && (newElement.textContent = row.content)
  row.id && (newElement.id = row.id)
  row.className && (newElement.className = row.className)
  row.onClick && (newElement.onclick = row.onClick)
  el.appendChild(newElement);
  return newElement
}
console.log('state: ', state.value)

let body = [{
  id: 'appBody',
  element: 'div',
  children: [{
    element: 'h1',
    content: 'This is a body'
  }, {
    element: 'p',
    content: 'Some body text here wchich shold be changed by buttons'
  }]
}]

const navBar = [{
  element: 'div',
  id: 'navbar',
  children: [{
    element: 'div',
    content: 'Nav bar txt 1',
    className: 'nav-button',
    onClick: () => state.update({ ...state.value, body: [{ element: 'h2', content: 'This is a body' }] })
  },
  {
    element: 'div',
    content: 'Nav bar txt 2',
    className: 'nav-button',
    onClick: () => state.update({ ...state.value, body: body })
  },
  ]
}]


const footer = [{
  element: 'footer',
  children: [
    {
      element: 'div',
      content: 'I am footer txt'
    }
  ]
}]

const contentJson = [
  navBar,
  {
    element: 'div',
    id: 'appBody',
    children: body
  },
  footer

]

state.update({
  navBar: navBar, body: body, footer: footer
})

console.log('state in bottom: ', state.value)

module.exports = hooks
