const cases = [2, 0, 1, 1, 1, 2];

export function declOfNum(numeric: number, titles: string[]) {  
  return titles[ (numeric % 100 > 4 && numeric % 100 < 20) ? 
    2 : cases[(numeric % 10 < 5) ? numeric % 10 : 5] ];  
}
