/**
 * Wraps the given object data in a Proxy.
 * Can call hooks whenever an item is updated.
 */
export interface IState {
  data: Record<string, any>
  hooks: Record<string, Array<Function>>
}
export function getStateObject(context: any, config: IState): Record<string, any> {
  const { data = {}, hooks = {} } = config;
  return new Proxy(data, {
    get(target, prop: string) {
      if (prop === "addHook") {
        /**
         * Allows new hooks to be registered after the fact using
         * stateObject.addHook(property, () => {})
         **/
        return (prop: string, value: Function) => {
          if (!hooks[prop]) {
            hooks[prop] = [];
          }
          hooks[prop].push(value);
        };
      }
      return Reflect.get(target, prop);
    },
    set(target, prop: string, value) {
      // TBD: Should it be possible for hooks to short-circuit the actual setting?
      hooks[prop]?.forEach((hook) => hook.call(context, value, target[prop]));
      return Reflect.set(target, prop, value);
    },
  });
}