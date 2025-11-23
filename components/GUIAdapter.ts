/**
 * GUI Adapter to provide lil-gui compatible interface
 * This allows the existing code to work while we transition to Leva
 */
export class GUIAdapter {
  private folders: Map<string, FolderAdapter> = new Map();
  private closed: boolean = false;

  addFolder(name: string): FolderAdapter {
    const folder = new FolderAdapter(name);
    this.folders.set(name, folder);
    return folder;
  }

  close() {
    this.closed = true;
  }

  open() {
    this.closed = false;
  }

  destroy() {
    this.folders.clear();
  }
}

class FolderAdapter {
  private name: string;
  private controllers: any[] = [];

  constructor(name: string) {
    this.name = name;
  }

  add(object: any, property: string, min?: number, max?: number, step?: number): ControllerAdapter {
    const controller = new ControllerAdapter(object, property, min, max, step);
    this.controllers.push(controller);
    return controller;
  }
}

class ControllerAdapter {
  private object: any;
  private property: string;
  private onChangeCallback?: (value: any) => void;

  constructor(object: any, property: string, min?: number, max?: number, step?: number) {
    this.object = object;
    this.property = property;
  }

  onChange(callback: (value: any) => void): ControllerAdapter {
    this.onChangeCallback = callback;
    return this;
  }

  step(value: number): ControllerAdapter {
    return this;
  }

  // Method to trigger onChange manually (called from Leva)
  triggerChange(value: any) {
    if (this.object && this.property) {
      this.object[this.property] = value;
    }
    if (this.onChangeCallback) {
      this.onChangeCallback(value);
    }
  }
}

