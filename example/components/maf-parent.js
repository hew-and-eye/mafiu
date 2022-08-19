import { registerMafiuComponent } from "../../dist/generator.js";

const name = "maf-parent"

const template = /*html*/`
  <p>I am a parent component. I have a <code>maf-child</code> component inside me.</p>
  <input placeholder="Enter a value here to update the child" mbind="inputValue:input"/>
  <maf-child mbind="count:countUpdated" exampleProp="{{inputValue}}"></maf-child>
  <div>How many times has the button been clicked? {{count}} times.</div>
`

registerMafiuComponent({ name, template, data: { count: 0 } })