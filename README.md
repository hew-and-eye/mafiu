# MAFIU (My Awesome Framework Is Unnecessary)

## Overview

It was only a matter of time before I decided that what the world really needed was another frontend framework.
The plan here is to do as little as possible to make Web Components more framework-like to work with.
Using MAFIU is the same as using native Web Components, just with a little more built-in stuff.

* Every component has a built-in state.
* The component automatically updates when the state updates. MAFIU automatically provisions `getObservedAttributes` and `attributeChangedCallback` for you.
* Component state change callbacks powered by Proxies.

And that's it. Those are the only features, because Web Components themselves should do most of the heavy lifting.

## Implementation

When registering a custom Web Component, you extend a class and overload some methods. This usually looks something like:

```javascript
window.customElements.define("your-component-name", class extends HTMLElement {
  static getObservedAttributes() {
    return ["a", "list", "of", "attributes", "that", "should", "trigger", "attributeChangedCallback"]
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // Update the component HTML, call APIs, whatever
    doStuff(name, newValue)
  }
  constructor() {
    // Initialize internal state, set HTML, etc.
  }
  onConnectedCallback() {
    // Do stuff when element is added to the DOM
    // This is when attributes become available
  }
})
```

MAFIU just creates a Web Component under the hood, but lets you be way more declarative:

```javascript
registerMafiuComponent({
  name: "your-component-name",
  template: "<div>Some arbitrary HTML string with references to the state variables: {{state}}</div>"
  data: {
    "your": "component",
    "state": "data"
  },
  hooks: {
    "state": [
      (value) => console.log("Oh look, someone updated the state: ", value)
    ]
  }
})
```

This will generate an anonymous class similar to the previous snippet and call `window.customElements.define` automatically.
The other important thing going on here is that the `data` value is actually optional. It's only needed if you want to provide initial/default values or if you have a hidden state.
Otherwise, the state variables can be inferred from the template itself.

## Usage

In the simplest case, your component registration could look something like this:

```javascript
// In a file called user-profile.js
{
  const name = "user-profile"
  const template = `
    <image class="profile-picture" src="{{userPicture}}"/>
    <div class="user-name">{{userName}}</div>
  `
  registerMafiuComponent({
    name,
    template
  })
}
```

```html
<!--When using your component-->
<user-profile userPicture="//uri-of-profile-picture.com" userName="Matthew Bernardo"/>
```

In this example, information would get processed as follows:

* The programmer will see the name of the component
* The programmer will see the markup that defines the appearance of the component.
* The programmer will see the names of the state variables.

This is (subjectively) a good information digestion process.

## Demo

Want to see a site that is completely vanilla except for some Mafiu components? Check [this](https://bernardo.lol/mafiu/index.html) out.
