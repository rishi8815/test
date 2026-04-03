import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Products from './pages/Products.tsx'
import { AppLayout } from './layouts/AppLayout'
import { PrivateRoute } from './routes/PrivateRoute'
import Transactions from './pages/Transactions.tsx'
import Payouts from './pages/Payouts.tsx'
import Profile from './pages/Profile.tsx'
import CustomerProduct from './pages/customer/CustomerProduct.tsx'
import PaymentPage from './pages/PaymentPage.tsx'
import PaymentSuccess from './pages/customer/PaymentSuccess.tsx'
import PaymentFailure from './pages/customer/PaymentFailure.tsx'
import Privacy from './pages/public/Privacy.tsx'
import Terms from './pages/public/Terms.tsx'
import DataDeletion from './pages/public/DataDeletion.tsx'
import AdminResellers from './pages/admin/AdminResellers.tsx'
import AdminTransactions from './pages/admin/AdminTransactions.tsx'
import AdminPayouts from './pages/admin/AdminPayouts.tsx'
import Marketing from './pages/Marketing.tsx'
import Reports from './pages/Reports.tsx'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/payouts" element={<PrivateRoute><Payouts /></PrivateRoute>} />
        <Route path="/marketing" element={<PrivateRoute><Marketing /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        <Route path="/admin/resellers" element={<PrivateRoute><AdminResellers /></PrivateRoute>} />
        <Route path="/admin/transactions" element={<PrivateRoute><AdminTransactions /></PrivateRoute>} />
        <Route path="/admin/payouts" element={<PrivateRoute><AdminPayouts /></PrivateRoute>} />

        <Route path="/customer/products/:id" element={<CustomerProduct />} />
        <Route path="/customer/checkout" element={<PaymentPage />} />
        <Route path="/customer/payment/success" element={<PaymentSuccess />} />
        <Route path="/customer/payment/failure" element={<PaymentFailure />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
