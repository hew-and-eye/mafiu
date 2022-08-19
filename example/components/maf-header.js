import { registerMafiuComponent } from "../../dist/generator.js";

const name = "maf-header"

const template = /*html*/`
  <h1>This page was built using the Mafiu framework</h1>
  <p>Mafiu stands for "My Awesome Framework Is Unnecessary", because there's really no reason that it needs to exist</p>
  <p>If you like using Web Components as natively as possible though, Mafiu adds a very tiny level of abstraction over the top for convenience</p>
  <p>(It's pronouced "maff-you")</p>
  <h4>Check out these components to test data binding, component nesting, etc. 👇</h4>
`

registerMafiuComponent({ name, template })