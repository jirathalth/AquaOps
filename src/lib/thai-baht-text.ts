const digitWords = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"] as const;
const positionWords = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"] as const;

function readUnderMillion(value: bigint) {
  if (value === 0n) return "";
  const digits = value.toString().padStart(6, "0");
  let result = "";
  for (let index = 0; index < digits.length; index += 1) {
    const digit = Number(digits[index]);
    if (!digit) continue;
    const position = digits.length - index - 1;
    if (position === 1 && digit === 1) result += "สิบ";
    else if (position === 1 && digit === 2) result += "ยี่สิบ";
    else if (position === 0 && digit === 1 && value % 10n === 1n && value > 10n) result += "เอ็ด";
    else result += `${digitWords[digit]}${positionWords[position]}`;
  }
  return result;
}

function readInteger(value: bigint): string {
  if (value < 1_000_000n) return readUnderMillion(value);
  const millions = value / 1_000_000n;
  const remainder = value % 1_000_000n;
  return `${readInteger(millions)}ล้าน${remainder === 1n ? "เอ็ด" : readUnderMillion(remainder)}`;
}

export function thaiBahtText(value: string) {
  const match = value.trim().match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return "";
  const negative = Boolean(match[1]);
  const baht = BigInt(match[2]);
  const satang = BigInt((match[3] ?? "").padEnd(2, "0"));
  const bahtText = baht === 0n ? digitWords[0] : readInteger(baht);
  const satangText = satang === 0n ? "ถ้วน" : `${readUnderMillion(satang)}สตางค์`;
  return `${negative ? "ลบ" : ""}${bahtText}บาท${satangText}`;
}
