import type { ArticleSegment } from "../types/material.ts";

// 50 common English sentences with Chinese translations
const sentences: [string, string][] = [
  ["I like to play outside with my friends.", "我喜欢和朋友们在外面玩。"],
  ["She reads a book every night before bed.", "她每晚睡前读一本书。"],
  ["The sun rises in the east every morning.", "太阳每天早晨从东方升起。"],
  ["We went to the park and had a picnic.", "我们去了公园野餐。"],
  ["He can ride a bicycle very fast.", "他骑自行车非常快。"],
  ["My mother makes delicious cookies on weekends.", "我妈妈周末做美味的饼干。"],
  ["Do you want to go swimming this afternoon?", "今天下午你想去游泳吗？"],
  ["The cat is sleeping under the warm sunshine.", "猫在温暖的阳光下睡觉。"],
  ["There is a beautiful rainbow after the rain.", "雨后有一道美丽的彩虹。"],
  ["Please remember to bring your homework tomorrow.", "请记得明天带作业。"],
];

export const defaultEnglishSentences: ArticleSegment[] = [
  ...sentences.map(
    ([en]): ArticleSegment => ({
      type: "paragraph",
      content: en,
    }),
  ),
  { type: "translation", content: "---translation---" },
  ...sentences.map(
    ([, zh]): ArticleSegment => ({
      type: "translation",
      content: zh,
    }),
  ),
];
