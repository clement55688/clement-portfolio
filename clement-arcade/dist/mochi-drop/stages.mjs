export const ARENA = Object.freeze({ width: 430, height: 650, left: 22, right: 408, floor: 620, line: 146, dropY: 70 });
export const STAGES = [
  { name: '小奶球', radius: 16, color: '#f2ddaf', points: 1, note: '小小一團，夢裡都是罐罐。' },
  { name: '糯米糰', radius: 23, color: '#ffd6ad', points: 3, note: '剛學會睜眼，就學會撒嬌。' },
  { name: '小橘寶', radius: 30, color: '#ffbb80', points: 6, note: '今天的工作：可愛。' },
  { name: '調皮鬼', radius: 38, color: '#ffc1bb', points: 10, note: '眨個眼，假裝不是牠做的。' },
  { name: '棉花糖', radius: 47, color: '#f3d68e', points: 15, note: '摸起來比看起來還要軟。' },
  { name: '胖橘橘', radius: 57, color: '#efbb94', points: 21, note: '不是變胖，是幸福溢出來了。' },
  { name: '大福貓', radius: 68, color: '#d6dfb8', points: 28, note: '驚！怎麼又多了一圈？' },
  { name: '超級飯糰', radius: 80, color: '#bad7cd', points: 36, note: '已經是一顆會呼吸的沙發。' },
  { name: '獅子毛球', radius: 93, color: '#f0d382', points: 45, note: '看起來威風，其實很怕吸塵器。' },
  { name: '喵喵國王', radius: 107, color: '#d9c5e6', points: 55, note: '這個家正式由貓統治。' },
  { name: '宇宙大胖貓', radius: 123, color: '#c6c7ed', points: 66, note: '引力的真相：宇宙裡有一隻胖貓。' }
];

export function daySeed(day) {
  let value = 2166136261;
  for (const c of day) value = Math.imul(value ^ c.charCodeAt(0), 16777619);
  return value >>> 0 || 1;
}

export function validDay(day) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day || '') && !Number.isNaN(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
}
