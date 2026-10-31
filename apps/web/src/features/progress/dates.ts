// Datas como "AAAA-MM-DD" no fuso local do navegador (o "dia" do usuário).

const pad = (n: number) => String(n).padStart(2, '0')

export function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parse(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function addDays(day: string, amount: number): string {
  const date = parse(day)
  date.setDate(date.getDate() + amount)
  return toLocalDate(date)
}

/** 0 = segunda … 6 = domingo. */
export function weekdayFromMonday(day: string): number {
  return (parse(day).getDay() + 6) % 7
}
