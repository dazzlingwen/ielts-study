// 种子数据：全部为原创模拟材料（非剑桥雅思真题内容）。
// 商业红线：剑桥雅思真题受版权保护，产品内不内置真题原文；
// 真题模块提供「套卷管理 + 成绩登记」框架，材料由用户自行录入或后续接入授权题库。

import { uid } from "./utils.js";

/* ---------------- 基础词汇 ---------------- */
export const baseWords = [
  { id: "w1", word: "mitigate", pos: "verb", phonetic: "/ˈmɪtɪɡeɪt/", meaning: "减轻，缓和", example: "Planting trees can help mitigate the effects of urban heat.", collocation: "mitigate the impact / mitigate climate change" },
  { id: "w2", word: "allocate", pos: "verb", phonetic: "/ˈæləkeɪt/", meaning: "分配，拨出", example: "Governments should allocate more resources to public transport.", collocation: "allocate resources / allocate funding" },
  { id: "w3", word: "incentive", pos: "noun", phonetic: "/ɪnˈsentɪv/", meaning: "激励，刺激", example: "Tax reductions may provide an incentive to recycle.", collocation: "a financial incentive / an incentive to do" },
  { id: "w4", word: "feasible", pos: "adjective", phonetic: "/ˈfiːzəbəl/", meaning: "可行的，行得通的", example: "The proposal is only feasible with long-term investment.", collocation: "economically feasible / a feasible solution" },
  { id: "w5", word: "detrimental", pos: "adjective", phonetic: "/ˌdetrɪˈmentəl/", meaning: "有害的，不利的", example: "Excessive screen time can be detrimental to sleep.", collocation: "detrimental to health / a detrimental effect" },
  { id: "w6", word: "substantial", pos: "adjective", phonetic: "/səbˈstænʃəl/", meaning: "大量的，显著的", example: "The project requires a substantial amount of funding.", collocation: "substantial evidence / a substantial increase" },
  { id: "w7", word: "compulsory", pos: "adjective", phonetic: "/kəmˈpʌlsəri/", meaning: "强制的，义务的", example: "Physical education should be compulsory in schools.", collocation: "compulsory education / compulsory attendance" },
  { id: "w8", word: "disparity", pos: "noun", phonetic: "/dɪˈspærəti/", meaning: "差异，悬殊", example: "The chart shows a disparity between rural and urban incomes.", collocation: "income disparity / a widening disparity" },
  { id: "w9", word: "curb", pos: "verb", phonetic: "/kɜːb/", meaning: "抑制，约束", example: "Higher fuel taxes could curb private car use.", collocation: "curb emissions / curb the spread" },
  { id: "w10", word: "pragmatic", pos: "adjective", phonetic: "/præɡˈmætɪk/", meaning: "务实的，讲究实效的", example: "A pragmatic approach would combine regulation with education.", collocation: "a pragmatic approach / a pragmatic solution" },
];

/* ---------------- 今日默认任务 ---------------- */
export function defaultTasks() {
  return [
    { id: uid(), skill: "听力", title: "精听一段材料，完成逐句听写", minutes: 25, done: false },
    { id: uid(), skill: "阅读", title: "限时完成一篇文章，给错题归因", minutes: 25, done: false },
    { id: uid(), skill: "写作", title: "写一个主体段：观点、解释、例子、回扣", minutes: 25, done: false },
    { id: uid(), skill: "口语", title: "围绕一个 Part 2 话题录音并回听重录", minutes: 15, done: false },
  ];
}

/* ---------------- 写作题目（原创） ---------------- */
export const writingPrompts = [
  "Some people believe that universities should focus on preparing students for employment. Others think that university education should serve a broader purpose. Discuss both views and give your own opinion.",
  "Some people think that governments should spend money on public services rather than on arts such as music and theatre. To what extent do you agree or disagree?",
  "In many countries, people are living longer than ever before. Do the advantages of an ageing population outweigh the disadvantages?",
  "Some people believe that international tourism creates more problems than benefits. Discuss both views and give your own opinion.",
  "Many people now work from home rather than in an office. Do the advantages of this development outweigh the disadvantages?",
];

/* ---------------- 听力材料（原创模拟，TTS 朗读） ----------------
 * 每句结构：{ en 原文, zh 参考译文, tip 听点提示 }
 * 商业版可整体替换为授权音频，数据结构保持不变。
 */
export const listeningMaterials = [
  {
    id: "lis-001",
    title: "Library Orientation",
    scene: "校园服务",
    section: "Section 1 难度",
    note: "图书馆员向新生介绍借书规则",
    script: [
      { en: "Good morning everyone, and welcome to the university library.", zh: "大家早上好，欢迎来到大学图书馆。", tip: "问候与开场，注意 welcome 的重音" },
      { en: "Your student card is also your library card, so please bring it with you every visit.", zh: "你的学生证就是借书证，所以每次来访请随身携带。", tip: "双重身份的同义转述：student card = library card" },
      { en: "Undergraduates can borrow up to ten books at a time, for a period of two weeks.", zh: "本科生一次最多可借十本书，借期为两周。", tip: "数字信息：10 本书、2 周，注意单位" },
      { en: "If you need a book for longer, you can renew it online, as long as nobody else has reserved it.", zh: "如果需要续借，可以在线办理，前提是没有人预约这本书。", tip: "条件句：as long as 引出前提" },
      { en: "The quiet study zone is on the second floor, and it is open until midnight during exam weeks.", zh: "静音自习区在二楼，考试周开放到午夜。", tip: "方位 + 时间：second floor / midnight" },
      { en: "Printing costs five pence per page, and you pay by topping up your card at the machine near the entrance.", zh: "打印每页五便士，在入口旁的机器上给你的卡充值支付。", tip: "价格信息：five pence per page" },
      { en: "If you have any questions, the help desk is just behind the main staircase.", zh: "如有任何问题，服务台就在主楼梯后面。", tip: "方位描述：behind the main staircase" },
    ],
  },
  {
    id: "lis-002",
    title: "Field Trip Arrangement",
    scene: "课程安排",
    section: "Section 2 难度",
    note: "老师向学生说明野外考察安排",
    script: [
      { en: "Right, let's go through the arrangements for next Thursday's field trip to the wetland reserve.", zh: "好，我们过一遍下周四湿地保护区考察的安排。", tip: "主题句：arrangements for the field trip" },
      { en: "We'll meet at the main gate at eight thirty, and the coach leaves at eight forty-five.", zh: "我们八点半在大门口集合，大巴八点四十五发车。", tip: "两个时间点：8:30 集合、8:45 发车" },
      { en: "Please wear waterproof boots, because some of the paths will be muddy after the rain.", zh: "请穿防水靴，因为雨后部分小路会很泥泞。", tip: "原因信号：because" },
      { en: "Each group should carry a first-aid kit, which I'll hand out at the end of today's session.", zh: "每个小组都要带一个急救包，我在今天课程结束后发给大家。", tip: "物品 + 发放方式" },
      { en: "The reserve has no phone signal, so tell your family not to worry if they cannot reach you.", zh: "保护区没有手机信号，所以告诉家人联系不到你也不必担心。", tip: "否定信息：no phone signal" },
      { en: "You'll need to complete a field report of about a thousand words within two weeks of the visit.", zh: "考察结束后两周内，你们需要完成一份约一千字的田野报告。", tip: "任务要求：1000 词 / 两周" },
    ],
  },
  {
    id: "lis-003",
    title: "Lecture: Urban Trees",
    scene: "学术讲座",
    section: "Section 3 难度",
    note: "环境科学讲座片段：城市树木的生态价值",
    script: [
      { en: "Today I'd like to examine why urban trees matter far beyond making streets look pleasant.", zh: "今天我想探讨为什么城市树木的价值远超美化街道。", tip: "讲座主旨句：beyond 引出深层论点" },
      { en: "A mature tree can intercept more than two thousand litres of storm water every year.", zh: "一棵成年树每年可以截留两千多升雨水。", tip: "数据：2000+ 升，注意量级" },
      { en: "In summer, a single street tree can cool the surrounding air by several degrees.", zh: "夏天，一棵行道树可以让周围空气降温数度。", tip: "因果逻辑：降温效果" },
      { en: "However, the benefits are not distributed equally across neighbourhoods.", zh: "然而，这些益处在各街区之间的分布并不均衡。", tip: "转折信号：however" },
      { en: "Areas with lower incomes tend to have fewer trees and therefore less shade and poorer air quality.", zh: "收入较低的区域树木往往更少，因此遮荫更少、空气质量更差。", tip: "因果链：fewer trees → less shade" },
      { en: "This raises an important question of fairness that city planners can no longer ignore.", zh: "这给城市规划者提出了一个不能再忽视的公平问题。", tip: "结论句：fairness 是核心概念" },
    ],
  },
];

/* ---------------- 阅读文章与题目（原创模拟） ----------------
 * 题型：判断（YES/NO/NOT GIVEN）+ 填空。
 * 答案与解析在题目数据中，作答后判分并展示。
 */
export const readingPassages = [
  {
    id: "rea-001",
    title: "The Hidden Life of Urban Trees",
    topic: "环境科学",
    minutes: 12,
    paragraphs: [
      "In many cities, trees are treated as decoration, something to be planted once streets and buildings are complete. Yet research over the past three decades suggests this view is badly outdated. Urban trees operate as living infrastructure, and their value can be measured in concrete terms.",
      "A mature canopy tree intercepts rainfall, easing pressure on drainage systems during storms. Studies in several mid-sized cities found that tree-lined streets experienced noticeably less surface flooding than comparable streets without cover. In one case, the presence of mature trees reduced storm-water runoff by roughly a third.",
      "Trees also regulate temperature. Through shade and evaporation, a single street tree can lower the temperature of the surrounding air on a hot afternoon. Neighbourhoods with dense canopy cover have been recorded as several degrees cooler than nearby areas with little vegetation.",
      "The benefits, however, are unevenly shared. Analyses in a number of countries show that wealthier districts tend to have more canopy cover, while lower-income areas often have far fewer trees per resident. The result is a measurable gap in summer temperatures and air quality between rich and poor neighbourhoods.",
      "Some cities have responded with planting programmes aimed at equity rather than appearance. Philadelphia, for example, has directed funding toward blocks with the lowest canopy cover. Early results suggest the approach works, but progress is slow: a street tree needs years of care before it delivers its full benefits.",
    ],
    questions: [
      { id: "q1", type: "判断题", prompt: "Urban trees were once mainly planted to reduce flooding.", options: ["YES", "NO", "NOT GIVEN"], answer: "NO", explain: "第一段说树木过去被当作装饰（decoration），而非防洪工具。" },
      { id: "q2", type: "判断题", prompt: "Tree-lined streets had less flooding than similar streets without trees.", options: ["YES", "NO", "NOT GIVEN"], answer: "YES", explain: "第二段明确指出树荫街道的地面洪水明显更少。" },
      { id: "q3", type: "判断题", prompt: "Philadelphia's programme is the largest in the United States.", options: ["YES", "NO", "NOT GIVEN"], answer: "NOT GIVEN", explain: "文中只提到费城把资金投向树冠覆盖最低的街区，未与其他城市比较规模。" },
      { id: "q4", type: "判断题", prompt: "Lower-income neighbourhoods usually have fewer trees per person.", options: ["YES", "NO", "NOT GIVEN"], answer: "YES", explain: "第四段指出低收入区域人均树木数量往往更少。" },
      { id: "q5", type: "判断题", prompt: "Street trees provide their full benefits immediately after planting.", options: ["YES", "NO", "NOT GIVEN"], answer: "NO", explain: "末段说行道树需要数年养护才能发挥全部效益。" },
      { id: "q6", type: "填空题", prompt: "In one study, mature trees reduced storm-water runoff by roughly a ______.", answer: ["third", "1/3", "one third"], explain: "第二段末句：reduced storm-water runoff by roughly a third。" },
      { id: "q7", type: "填空题", prompt: "Trees cool the air through shade and ______.", answer: ["evaporation"], explain: "第三段第二句：Through shade and evaporation。" },
      { id: "q8", type: "填空题", prompt: "Philadelphia directs funding toward blocks with the lowest ______ cover.", answer: ["canopy"], explain: "末段：blocks with the lowest canopy cover。" },
    ],
  },
  {
    id: "rea-002",
    title: "Why We Forget Most of What We Read",
    topic: "认知心理",
    minutes: 12,
    paragraphs: [
      "Ask adults what they learned from books they read last year and most will struggle to give details. This is not a personal failing. Decades of memory research show that reading alone, without effort, produces surprisingly shallow and short-lived memories.",
      "The core problem is that fluent reading feels like learning. When text flows smoothly, we experience a sense of familiarity that is easily mistaken for knowledge. Psychologists call this the fluency illusion. Rereading a chapter reinforces the feeling without strengthening the memory itself.",
      "A more reliable technique is retrieval practice: closing the book and forcing yourself to recall the main ideas. Experiments repeatedly show that people who test themselves remember far more after a week than those who simply reread. The act of struggling to recall is what builds durable memory.",
      "Spacing matters too. Cramming can produce short-term gains, but memories formed in a single session fade quickly. The same amount of study spread across several days leads to substantially better retention, which is why short daily practice beats a weekend marathon.",
      "None of this requires special talent. It requires changing the default habit: instead of asking 'have I read it?', ask 'can I retrieve it?'. For self-directed learners, that small shift in question may matter more than any app.",
    ],
    questions: [
      { id: "q1", type: "判断题", prompt: "Most adults can easily recall details from books read last year.", options: ["YES", "NO", "NOT GIVEN"], answer: "NO", explain: "第一段首句说大多数成年人难以给出细节。" },
      { id: "q2", type: "判断题", prompt: "The fluency illusion refers to mistaking familiarity for knowledge.", options: ["YES", "NO", "NOT GIVEN"], answer: "YES", explain: "第二段：a sense of familiarity that is easily mistaken for knowledge。" },
      { id: "q3", type: "判断题", prompt: "Rereading is more effective than retrieval practice after one week.", options: ["YES", "NO", "NOT GIVEN"], answer: "NO", explain: "第三段指出自测者一周后的记忆远好于重读者。" },
      { id: "q4", type: "判断题", prompt: "The writer recommends studying only at weekends.", options: ["YES", "NO", "NOT GIVEN"], answer: "NO", explain: "第四段明确说短日练优于周末突击。" },
      { id: "q5", type: "判断题", prompt: "The writer has designed a memory training app.", options: ["YES", "NO", "NOT GIVEN"], answer: "NOT GIVEN", explain: "末段提到 app 只是类比，未说自己开发了 app。" },
      { id: "q6", type: "填空题", prompt: "Fluent reading creates a feeling of ______ that feels like learning.", answer: ["familiarity"], explain: "第二段：a sense of familiarity。" },
      { id: "q7", type: "填空题", prompt: "Closing the book and recalling main ideas is called retrieval ______.", answer: ["practice"], explain: "第三段：retrieval practice。" },
      { id: "q8", type: "填空题", prompt: "Cramming may bring short-term gains, but memories fade ______.", answer: ["quickly"], explain: "第四段：memories formed in a single session fade quickly。" },
    ],
  },
];

/* ---------------- 原创模拟套卷 ---------------- */
export const mockPapers = [
  {
    id: "paper-mock-1",
    name: "模拟卷 A：校园与认知",
    source: "原创模拟",
    date: "",
    listeningId: "lis-001",
    readingId: "rea-002",
    writingPrompt: writingPrompts[1],
  },
  {
    id: "paper-mock-2",
    name: "模拟卷 B：城市与环境",
    source: "原创模拟",
    date: "",
    listeningId: "lis-003",
    readingId: "rea-001",
    writingPrompt: writingPrompts[3],
  },
];

/** 听力材料查表 */
export const listeningById = Object.fromEntries(listeningMaterials.map((m) => [m.id, m]));
/** 阅读文章查表 */
export const readingById = Object.fromEntries(readingPassages.map((p) => [p.id, p]));
