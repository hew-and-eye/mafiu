import { getStateObject, IState } from "./getStateObject.js";
import { getParsedTemplate } from "./getParsedTemplate.js";

interface IMafiuGeneratorProps extends IState {
  name: string;
  template: string;
  handlers: Record<string, Function>;
}

type Dependency = Record<string, Array<any>>

export function registerMafiuComponent({ name, template, data = {}, hooks = {}, handlers = {} }: IMafiuGeneratorProps) {
  getImplicitVariables(template).forEach((stateVariable) => {
    data[stateVariable] = data[stateVariable] ?? "";
  });

  // Store list of state variables so we don't need to recompute it
  data._stateVars = Object.keys(data);


  // Process template string so it can be granularly updated
  template = getParsedTemplate(template, data);

  // Generate a class that manages internal state and re-rendering
  const MafiuElementClass = class extends HTMLElement {
    state?: Record<string, any>
    handlers?: Record<string, Function>
    dependencyTree?: Dependency
    static get observedAttributes() {
      return data._stateVars.map((v: string) => v.toLowerCase());
    }
    constructor() {
      super();
    }
    connectedCallback() {
      this.innerHTML = template;
      this.addListeners();
      this.dependencyTree = this.parseDependencies();
      Object.assign(hooks, this.getRenderHooks({ data, hooks }))
      this.state = getStateObject(this, { data, hooks });
      this.handlers = handlers
      // Update state variables based on attributes
      this.state._stateVars.forEach((stateVariable: string) => {
        if (this.hasAttribute(stateVariable)) {
          if (this.state) {
            this.state[stateVariable] = this.getAttribute(stateVariable);
          }
        }
      });
    }
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      if (!this.state) {
        return
      }
      const variable = data._stateVars.find((v: string) => v.toLowerCase() === name)
      this.state[variable] = newValue;
    }
    parseDependencies() {
      const dependencyTree: Record<string, Array<any>> = {};
      this.querySelectorAll("[has-mdeps]").forEach((el) => {
        // TODO: Handle cases where an attribute has "-" in it.
        const dependencies = el
          .getAttributeNames()
          .filter((attr) => attr.startsWith("mdep"));
        dependencies.forEach((dep) => {
          let [prefix, attribute, variable] = dep.split("-");
          variable = data._stateVars.find((v: string) => v.toLowerCase() === variable)
          if (variable) {
            if (!dependencyTree[variable]) {
              dependencyTree[variable] = [];
            }
            dependencyTree[variable].push({
              el,
              attribute,
              innerText: !attribute
            });
          }
        });
      });
      return dependencyTree
    }
    getRenderHooks({ data, hooks }: IState) {
      return Object.keys(data).reduce((acc: Dependency, prop) => {
        acc[prop] = hooks[prop] || []
        acc[prop].push((newVal: any) => {
          if (this.dependencyTree) {
            this.dependencyTree[prop]?.forEach(({ el, attribute, innerText }) => {
              if (attribute) {
                el.setAttribute(attribute, newVal)
              } else {
                el.innerText = newVal
              }
            })
          }
        })
        return acc
      }, {})
    }
    addListeners() {
      this.querySelectorAll("[mbind]").forEach((el) => {
        // @ts-ignore
        const [binding, event] = el.getAttribute("mbind").split(":");
        console.log("Going to add a listener", binding, event)
        el.addEventListener(event, (e) => {
          // TODO: Handle different tag types
          // @ts-ignore
          this.state[binding] = e.detail || e.target.value;
        });
      });
      this.querySelectorAll("[mhandle]").forEach((el) => {
        // @ts-ignore
        const [handlerName, event] = el.getAttribute("mhandle").split(":");
        el.addEventListener(event, (e) => {
          // @ts-ignore
          this.handlers[handlerName].call(this, e)
          e.stopImmediatePropagation()
        });
      });
    }
  };
  window.customElements.define(name, MafiuElementClass);
}

function getImplicitVariables(template: string): Array<string> {
  const stateVariables: Array<string> = [];
  template.match(/{{([^}}]*)}}/gm)?.forEach(ref => {
    const variableName = ref.replace("{{", "").replace("}}", "")
    stateVariables.push(variableName);
  });
  return stateVariables;
}
