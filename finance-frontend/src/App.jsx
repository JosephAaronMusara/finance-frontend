import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AccountReceivable from './components/AccountReceivables.jsx';
import Expenses from './components/Expenses.jsx';
import BankBalances from './components/BankBalances.jsx';
import CurrencyCrud from './components/Currencies.jsx';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Finance</h1>
        <Routes>
          <Route path="/account-receivables" element={<AccountReceivable />} />
          <Route path="/expense" element={<Expenses />} />
          <Route path='/bankbalance' element={<BankBalances />} />
          <Route path='/rates' element={<CurrencyCrud />} />
          <Route path="/" element={<AccountReceivable />} /> {/* Dflt rt */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
