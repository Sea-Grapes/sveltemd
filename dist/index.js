import matter from "gray-matter";
import { parseEntities } from "parse-entities";
import path from "path";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { codeToHtml } from "shiki";
import slash from "slash";
import { parse } from "svelte/compiler";
import { globSync } from "tinyglobby";
import { unified } from "unified";
import { visit } from "unist-util-visit";

//#region src/main.ts
let plugin = {
	extensions: [".md", ".svx"],
	layout_file_name: "md.svelte",
	internal: { indent: " " }
};
function get_layout_paths(filename) {
	const layout_paths = globSync("./src/routes/**/md.svelte");
	console.log(layout_paths);
	const file_path = slash(path.relative(process.cwd(), filename)).split("/").slice(0, -1).join("/");
	return layout_paths.filter((layout_file) => {
		const layout_dir = path.dirname(layout_file);
		return file_path.startsWith(layout_dir);
	}).map((str) => "/" + str);
}
const svelte_err = Object.entries({
	"{": "&lbrace;",
	"}": "&rbrace;",
	"<": "&lt;",
	">": "&gt;"
});
function escape_code(string) {
	for (const [key, value] of svelte_err) string = string.replaceAll(key, value);
	return string;
}
function remark_code() {
	async function escape(node) {
		node.value = escape_code(node.value);
		if (node.type === "code") {
			const lang = node.lang || "text";
			node.value = await codeToHtml(node.value, {
				lang,
				theme: "dark-plus"
			});
			node.type = "html";
		}
	}
	return async function(tree) {
		let nodes = [];
		visit(tree, "code", (node) => nodes.push(node));
		visit(tree, "inlineCode", (node) => nodes.push(node));
		await Promise.all(nodes.map((node) => escape(node)));
	};
}
const md_parser = unified().use(remarkParse).use(remark_code).use(remarkRehype, {
	allowDangerousHtml: true,
	allowDangerousCharacters: true
}).use(rehypeStringify, {
	allowDangerousHtml: true,
	allowDangerousCharacters: true
});
async function md_to_html_str(string) {
	let res = await md_parser.process(string);
	return String(res);
}
async function parse_svm(md_file, filename) {
	console.log("Processing file:", filename);
	let { data, content } = matter(md_file);
	let has_data = Object.keys(data).length > 0;
	let svelte_logic = [];
	content = content.replace(/\{[#/:@][^}]*\}/g, (match) => {
		const id = `<div data-svelte-block="${svelte_logic.length}"></div>`;
		svelte_logic.push(match);
		return id;
	});
	content = await md_to_html_str(content);
	content = parseEntities(content);
	svelte_logic.forEach((text, i) => {
		content = content.replace(`<div data-svelte-block="${i}"></div>`, text);
	});
	console.log(content);
	let res = "";
	const svast = parse(content, { modern: true });
	const extract = (section) => {
		if (!section || section.start == section.end) return "";
		return content.slice(section.start, section.end);
	};
	if (svast.module) {
		let module = extract(svast.module);
		let content$1 = extract(svast.module.content);
		let meta = data ? `\n  export const metadata = ${JSON.stringify(data)};\n` : "";
		let content_2 = meta + content$1;
		res += module.replace(content$1, content_2);
	} else if (data) {
		let meta = `\n  export const metadata = ${JSON.stringify(data)};\n`;
		res += `<script module>${meta}<\/script>\n`;
	}
	let layouts = get_layout_paths(filename);
	if (svast.instance) {
		let instance = extract(svast.instance);
		let content$1 = extract(svast.instance?.content);
		if (layouts.length) {
			let imports = "\n" + layouts.map((path$1, i) => `  import SVELTEMD_LAYOUT_${i} from '${path$1}'`).join("\n") + "\n";
			instance = instance.replace(content$1, imports + content$1);
		}
		res += instance;
	} else if (layouts.length) {
		let imports = "\n<script>\n" + layouts.map((path$1, i) => `  import SVELTEMD_LAYOUT_${i} from '${path$1}'`).join("\n") + "\n<\/script>\n";
		res += imports;
	}
	if (svast.fragment) {
		let html = svast.fragment.nodes.map((node) => {
			let text = content.slice(node.start, node.end);
			return text;
		}).join("");
		if (layouts.length) html = layouts.reduce((content$1, layout, i) => {
			return `<SVELTEMD_LAYOUT_${i} ${has_data ? "{...metadata}" : ""}>\n${content$1}\n</SVELTEMD_LAYOUT_${i}>`;
		}, html);
		res += "\n" + html + "\n";
	}
	if (svast.css) res += extract(svast.css);
	return { code: res };
}
function markdown(config) {
	console.log("plugin generated");
	plugin = {
		...plugin,
		...config
	};
	return {
		name: "markdown",
		markup({ content, filename }) {
			if (filename.endsWith(".md")) return parse_svm(content, filename);
		}
	};
}

//#endregion
export { markdown };