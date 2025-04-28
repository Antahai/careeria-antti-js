



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

  update(newValue) {
    this.#_value = newValue;
    const updateEvent = new CustomEvent("update");
    this.dispatchEvent(updateEvent);
  }
}
const defaultState = [{id: 'loading', element: 'h2', content: 'Ladataan...'}]
const state = new StateHook({navBar: [], body: defaultState, navBar: []});

new RenderHook(() => document.getElementById("root"))
  .use(state)
  .modify((el) => {
    el.innerHTML = ""

    loopElement(el, state.value.navBar)
    loopElement(el, state.value.body)
    loopElement(el, state.value.us)
    loopElement(el, state.value.footer)
  });

//  build elements from json array for web page
const loopElement = (el, elemntsArray) => {
  Array.isArray(elemntsArray) && elemntsArray.map(row => {
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
  
              
                const newbie4 = createNewElement(newbie3, row4)
                if (row4.children) {
                  row4.children.map(row5 => {
                    createNewElement(newbie4, row5)
                  })
                }  
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
  const keyValues = Object.keys(row)
  keyValues.map( k => newElement[k] = row[k])
  el.appendChild(newElement);
  return newElement
}

let body = [{
  id: 'appBody',
  element: 'div',
  children: [{
    element: 'h1',
    className: "loading",
    textContent: 'Ladataan...'
  }, {
    element: 'p',
    content: 'Sivustoa ladataan...'
  }]
}]

const navBar = [{
  element: 'div',
  id: 'navbar',
  children: [{
    element: 'a',
    href: "#",
    textContent: 'Etusivu',
    onclick: () => fetchData('etusivu')
  },{
    element: 'a',
    href: "#",
    textContent: 'Palvelut',
    onclick: () => fetchData('palvelut')
  },{
    element: 'a',
    href: "#",
    textContent: 'Yhteystiedot',
    onclick: () => fetchData('yhteystiedot')
  },
  {
    element: 'a',
    textContent: 'Teema',
    onclick: () => toggleTheme()
  }
  ]
}]


// get theme theme
const rootEl = document.getElementById('root')
rootEl.setAttribute('class', localStorage.getItem('theme'))
state.update({ ...state.value,  theme: localStorage.getItem('theme')})

// theme toogle
const toggleTheme = () => {
const theme = state.value.theme 
  state.update({ ...state.value,  theme: state.value.theme === 'light' ? 'dark' : 'light' })
  rootEl.setAttribute('class', state.value.theme )
  localStorage.setItem('theme', state.value.theme )
}

const footer = [{
  element: 'footer',
  children: [
    {
      element: 'h4',
      textContent: 'The Company Oy'
    },
    {
      element: 'span',
      textContent: 'Sepusenkatu 22, 15123 Mähkömaa' 
     }
  ]
}]

state.update({
  navBar: navBar, body: body, us: [], footer: footer, theme: localStorage.getItem('theme')
})

// load front page 
fetchData('etusivu')

// fetch function
async function fetchData( page ) {
  window.scrollTo({ top: 0,  behavior: 'smooth' })

  try {
      const response = await fetch('http://localhost:3004/api/content/' + page)
      const data = await response.json() // muutetaan json => javascript muotoon
      let us = []

      // mapping duunarit to the page
      if(page === 'yhteystiedot'){
        const response2 = await fetch('http://localhost:3004/api/content/duunarit/')
        const duunarit = await response2.json() // muutetaan json => javascript muotoon
        us = duunaritJsonForPage(duunarit)
      }
      // updating nav state is item passive / active
      const updatedNav = navBar.map(item => {
        const children = item.children.map(child => {

          // if page page title is same than page
          if(child.textContent.toLowerCase() === page){
            return {...child, className: 'active' }
            // if no, set it passive
          } else return  {...child, className: 'passive' }
        })
        item.children = children
        return item
      })
      try{
        // updating state
        state.update({ ...state.value, nav: updatedNav, body: [{element: 'div', id: 'body-container', children: JSON.parse(data) }], us: us })
      } catch(e){
        // if error update state to be loading...
        state.update({ ...state.value, body: [{element: 'div', id: 'body-container', children: defaultState}]})

      }

      
  // Virhetilanteen hallinta
  } 
  catch (error) {
      console.error("Error fetching data:", error)
      state.update({ ...state.value, body: [{element: 'div', id: 'body-container', children: defaultState}], active: page })
  }

  }

const duunaritJsonForPage = (duunarit) => {
  let ukkelit = []
  JSON.parse(duunarit).map( duunari => {
    const line = {
      element: 'div',
      className: 'worker',
      children: [
        {
          element: 'img',
          src: 'media/' + duunari.img
        },
        {
          element: 'h5',
          textContent: `${duunari.etunimi} ${duunari.sukunimi}`
        },
        {
          element: 'span',
          textContent: duunari.kuvaus
        }
      ]
    }
    ukkelit.push(line)
    
  })
  const ret = [
    {
      element: 'div',
      className: 'workers-container',
      children: ukkelit
    }
  ]
  return ret

  
}