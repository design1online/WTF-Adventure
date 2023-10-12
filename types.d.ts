export {};

declare global {
    interface Window { // ⚠️ notice that "Window" is capitalized here
      $: any
      jQuery: any
    }
}

declare module "*.png" {
    const value: any;
    export = value;
}

declare module "*.jpg" {
    const value: any;
    export = value;
}

declare module "*.gif" {
    const value: any;
    export = value;
}