import { generate } from "./generate";
import { parserHTML } from "./parser";

export function compileToFunction(template) {
  let root = parserHTML(template);

  // 生成代码
  let code = generate(root);
  // code 中会用到数据 数据在vm上
  const render = new Function(`with(this){return ${code}}`);

  return render;
}
