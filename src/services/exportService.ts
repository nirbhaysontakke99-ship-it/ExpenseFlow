import { transactionRepository } from '@/data/repositories/transactionRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { goalRepository } from '@/data/repositories/goalRepository';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { userRepository } from '@/data/repositories/userRepository';

export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function generateExportCSV(userId: string): Promise<string> {
  const transactions = await transactionRepository.getAllByUserId(userId);
  const categories = await categoryRepository.getAll(userId);
  const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));

  const budgets = await budgetRepository.getByUserId(userId);
  const goals = await goalRepository.getByUserId(userId);
  const recurring = await recurringRepository.getByUserId(userId);

  const lines: string[] = [];

  // Header Section: ExpenseFlow Export Info
  lines.push(`"ExpenseFlow Data Export"`);
  lines.push(`"Export Date",${escapeCSVCell(new Date().toISOString())}`);
  lines.push('');

  // 1. TRANSACTIONS
  lines.push(`"--- TRANSACTIONS ---"`);
  lines.push(`"Date","Type","Category","Amount","Payment Method","Note"`);
  for (const t of transactions) {
    if (t.deleted_at) continue;
    const catName = categoriesMap.get(t.category_id) || 'General';
    const amountRupees = (t.amount / 100).toFixed(2);
    lines.push(
      [
        escapeCSVCell(t.date),
        escapeCSVCell(t.type.toUpperCase()),
        escapeCSVCell(catName),
        escapeCSVCell(amountRupees),
        escapeCSVCell(t.payment_method),
        escapeCSVCell(t.note || ''),
      ].join(',')
    );
  }
  lines.push('');

  // 2. BUDGETS
  lines.push(`"--- BUDGETS ---"`);
  lines.push(`"Month","Year","Category","Limit Amount"`);
  for (const b of budgets) {
    const catName = b.category_id ? categoriesMap.get(b.category_id) || 'General' : 'Overall Monthly Budget';
    const amountRupees = (b.amount / 100).toFixed(2);
    lines.push(
      [
        escapeCSVCell(b.month),
        escapeCSVCell(b.year),
        escapeCSVCell(catName),
        escapeCSVCell(amountRupees),
      ].join(',')
    );
  }
  lines.push('');

  // 3. SAVINGS GOALS
  lines.push(`"--- SAVINGS GOALS ---"`);
  lines.push(`"Goal Name","Target Amount","Saved Amount","Target Date","Status"`);
  for (const g of goals) {
    lines.push(
      [
        escapeCSVCell(g.name),
        escapeCSVCell((g.target_amount / 100).toFixed(2)),
        escapeCSVCell((g.current_amount / 100).toFixed(2)),
        escapeCSVCell(g.target_date || 'N/A'),
        escapeCSVCell(g.status),
      ].join(',')
    );
  }
  lines.push('');

  // 4. RECURRING EXPENSES
  lines.push(`"--- RECURRING EXPENSES ---"`);
  lines.push(`"Title","Frequency","Amount","Next Due Date","Payment Method","Active"`);
  for (const r of recurring) {
    lines.push(
      [
        escapeCSVCell(r.title),
        escapeCSVCell(r.frequency),
        escapeCSVCell((r.amount / 100).toFixed(2)),
        escapeCSVCell(r.next_date),
        escapeCSVCell(r.payment_method),
        escapeCSVCell(r.active ? 'YES' : 'NO'),
      ].join(',')
    );
  }

  return lines.join('\n');
}

export async function downloadUserDataCSV(): Promise<void> {
  const user = await userRepository.getCurrentUser();
  const userId = user?.id || 'default_user';

  const csvContent = await generateExportCSV(userId);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `ExpenseFlow_Export_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
