import { registerMafiuComponent } from "../../dist/generator.js";

const name = "maf-child"

const template = /*html*/`
  <p>I'm a child component. Mafiu lets you nest components and pass props to the children.</p>
  <p class="prop-example">{{exampleProp}}</p>
  <p>
    You can also send events from the child to the parent.
    <button mhandle="countHandler:click">click me</button>
  </p>
`

registerMafiuComponent({
  name,
  template,
  data: {
    count: 0
  },
  hooks: {
    count: [
      function (newCount) {
        this.dispatchEvent(new CustomEvent("countUpdated", { detail: newCount }))
      }
    ]
  },
  handlers: {
    countHandler() {
      this.state.count++
    }
  }
})