"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  ArrowUpDown,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusBadge } from "@/lib/utils";

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  customerInfo: any;
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const itemsPerPage = 10;

  // Mock data - nanti diganti dengan API real
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        transactionId: "TXN20241201001",
        amount: 150000,
        status: "success",
        paymentMethod: "QRIS",
        createdAt: "2024-12-01T14:30:00Z",
        customerInfo: { name: "Ahmad Rizki", email: "ahmad@example.com", phone: "08123456789" }
      },
      {
        id: "2",
        transactionId: "TXN20241201002",
        amount: 75000,
        status: "holding",
        paymentMethod: "BCA VA",
        createdAt: "2024-12-01T13:15:00Z",
        customerInfo: { name: "Budi Santoso", email: "budi@example.com", phone: "08123456780" }
      },
      {
        id: "3",
        transactionId: "TXN20241130001",
        amount: 200000,
        status: "success",
        paymentMethod: "OVO",
        createdAt: "2024-11-30T10:45:00Z",
        customerInfo: { name: "Citra Dewi", email: "citra@example.com", phone: "08123456781" }
      },
      {
        id: "4",
        transactionId: "TXN20241129001",
        amount: 500000,
        status: "pending",
        paymentMethod: "Mandiri VA",
        createdAt: "2024-11-29T09:20:00Z",
        customerInfo: { name: "Dewi Kartika", email: "dewi@example.com", phone: "08123456782" }
      },
      {
        id: "5",
        transactionId: "TXN20241128001",
        amount: 350000,
        status: "released",
        paymentMethod: "DANA",
        createdAt: "2024-11-28T16:00:00Z",
        customerInfo: { name: "Eko Prasetyo", email: "eko@example.com", phone: "08123456783" }
      },
    ];
    setTransactions(mockTransactions);
    setLoading(false);
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: transactions.length,
    success: transactions.filter(t => t.status === "success").length,
    pending: transactions.filter(t => t.status === "pending").length,
    holding: transactions.filter(t => t.status === "holding").length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToCSV = () => {
    const headers = ["Transaction ID", "Amount", "Status", "Payment Method", "Date", "Customer Name", "Customer Email"];
    const rows = filteredTransactions.map(tx => [
      tx.transactionId,
      tx.amount,
      tx.status,
      tx.paymentMethod,
      new Date(tx.createdAt).toLocaleString(),
      tx.customerInfo?.name || "-",
      tx.customerInfo?.email || "-"
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
        <p className="text-gray-400 mt-1">View and manage all your payment transactions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-gray-400 text-sm">Success</p>
          <p className="text-2xl font-bold text-green-400">{stats.success}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-gray-400 text-sm">Holding</p>
          <p className="text-2xl font-bold text-blue-400">{stats.holding}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-gray-400 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.totalAmount)}</p>
        </motion.div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="holding">Holding</option>
            <option value="released">Released</option>
            <option value="failed">Failed</option>
          </select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr className="text-left text-sm">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedTransactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{tx.transactionId}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.transactionId); }}
                          className="opacity-0 group-hover:opacity-100 hover:text-purple-400"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{tx.customerInfo?.name || "-"}</p>
                        <p className="text-xs text-gray-400">{tx.customerInfo?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(tx.amount)}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {getStatusBadge(tx.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); setShowDetailModal(true); }}
                        className="p-1 hover:bg-white/10 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4 text-purple-400" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/10 disabled:opacity-50 hover:bg-white/20 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/10 disabled:opacity-50 hover:bg-white/20 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showDetailModal && selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transaction Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono text-sm">{selectedTransaction.transactionId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold text-green-400">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusBadge(selectedTransaction.status)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Payment Method</span>
                  <span>{selectedTransaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Date</span>
                  <span>{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Customer Name</span>
                  <span>{selectedTransaction.customerInfo?.name || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Customer Email</span>
                  <span>{selectedTransaction.customerInfo?.email || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Customer Phone</span>
                  <span>{selectedTransaction.customerInfo?.phone || "-"}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
