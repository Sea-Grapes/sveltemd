//#region src/main.d.ts
type Extension = ".md" | ".svelte" | ".svx" | (string & {});
interface PluginConfig {
  extension?: Extension;
  extensions?: Extension[];
  layout_file_name?: string;
  internal?: {
    indent: string;
  };
}
declare function markdown(config: PluginConfig): {
  name: string;
  markup({
    content,
    filename
  }: {
    content: string;
    filename: string;
  }): string;
};
//#endregion
export { markdown };