import Icon from './Icon';
import { useVuna } from '../context';
import { CAT_EMOJI, convert, fmtMoney, fmtDate } from '../utils/storage';

export default function EntryRow({ entry, type }) {
  const { data, actions } = useVuna();
  const { currency, rates } = data;
  const isIncome = type === 'income';
  const emoji = isIncome ? '💼' : (CAT_EMOJI[entry.category] || '✳️');
  const title = entry.description || (isIncome ? entry.source : entry.category);
  const kind = isIncome ? 'Income' : entry.category;
  const foreign = entry.currency !== currency;

  return (
    <div className="row">
      <span className={`row-icon ${isIncome ? 'row-icon-in' : 'row-icon-out'}`}>{emoji}</span>
      <div className="row-main">
        <div className="row-title">{title}</div>
        <div className="row-meta">{kind} · {fmtDate(entry.date)} · {entry.currency}</div>
      </div>
      <div className="row-amount">
        <div className={isIncome ? 'amt-in' : 'amt-out'}>
          {isIncome ? '+' : '−'} {fmtMoney(entry.amount, entry.currency)}
        </div>
        {foreign && (
          <div className="row-approx">≈ {fmtMoney(convert(entry.amount, entry.currency, currency, rates), currency)}</div>
        )}
      </div>
      <button className="icon-btn row-del" aria-label="Delete entry"
        onClick={() => actions.deleteEntry(type, entry.id)}>
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}
