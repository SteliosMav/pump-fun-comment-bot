export class DependencyContainer {
  private instances = new Map<string, object>();

  // Register using only the instance
  register(instance: object): void {
    const key = instance.constructor.name;
    this.instances.set(key, instance);
  }

  // Resolve by class reference
  resolve<T>(ClassRef: new (...args: any[]) => T): T {
    const key = ClassRef.name;
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`Dependency ${key} not found in container.`);
    }
    return instance as T;
  }
}
