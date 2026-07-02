export function parseSalary(salaryRange: string | null): number | null {
  if (!salaryRange) return null;
  const cleaned = salaryRange.replace(/,/g, "").trim();
  const numbers = cleaned.match(/[\d]+(?:\.\d+)?/g);
  if (!numbers) return null;
  const nums = numbers.map(Number).filter((n) => n > 0);
  if (nums.length === 0) return null;
  const maxVal = Math.max(...nums);

  if (/lpa/i.test(cleaned)) return maxVal;

  if (/\$/.test(cleaned)) {
    if (/k/i.test(cleaned)) return Math.round((maxVal * 1000) / 100000 * 10) / 10;
    return Math.round(maxVal / 100000 * 10) / 10;
  }

  if (/₹/.test(cleaned) || /inr/i.test(cleaned)) {
    return Math.round(maxVal / 100000 * 10) / 10;
  }

  if (maxVal > 100000) return Math.round(maxVal / 100000 * 10) / 10;
  if (maxVal > 1000) return Math.round((maxVal * 1000) / 100000 * 10) / 10;
  if (maxVal > 100) return Math.round(maxVal * 100000 / 100000 * 10) / 10;

  return Math.round(maxVal / 100000 * 10) / 10;
}

export function getSalaryBucket(lpa: number): string {
  if (lpa < 5) return "<5 LPA";
  if (lpa < 10) return "5-10 LPA";
  if (lpa < 20) return "10-20 LPA";
  return "20+ LPA";
}

export function formatSalary(lpa: number): string {
  if (lpa >= 1) return `${lpa.toFixed(1)} LPA`;
  return `₹${Math.round(lpa * 100000).toLocaleString("en-IN")}`;
}
