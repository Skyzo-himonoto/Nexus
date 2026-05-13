"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Building2,
  Smartphone,
  CreditCard,
  History,
  Download
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface WithdrawRequest {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "REJECTED";
  createdAt: string;
}

const banks = [
  { code: "BCA", name: "BCA", icon: <Building2 className="w-4 h-4" /> },
  { code: "MANDIRI", name: "Mandiri", icon: <Building2 className="w-4 h-4" /> },
  { code: "BNI", name: "BNI", icon: <Building2 className="w-4 h-4" /> },
  { code: "BRI", name: "BRI", icon: <Building2 className="w-4 h-4" /> },
  { code: "CIMB", name: "CIMB Niaga", icon: <Building2 className="w-4 h-4" /> },
  { code: "OVO", name: "OVO", icon: <Smartphone className="w-4 h-4" /> },
  { code: "DANA", name: "DANA", icon: <Smartphone className="w-4 h-4" /> },
  { code: "GOPAY", name: "GoPay", icon: <Smartphone className="w-4 h-4" /> },
];

export default function WithdrawPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState({
    available: 2500000,
    holding: 1200000,
    withdraw: 0,
  });
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawRequest[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "BCA",
    accountNumber: "",
    accountName: "",
  });
  const [preview, setPreview] = useState({ amount: 0, fee: 3000, net: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const WITHDRAW_FEE = 3000;
  const MIN_WITHDRAW = 10000;

  useEffect(() => {
    // Mock data - nanti diganti dengan API real
    const mockHistory: WithdrawRequest[] = [
      {
        id: "1",
        amount: 500000,
        fee: 3000,
        netAmount: 497000,
        bankName: "BCA",
        accountNumber: "1234567890",
        accountName: "John Doe",
        status: "SUCCESS",
        createdAt: "2024-11-25T10:30:00Z",
      },
      {
        id: "2",
        amount: 250000,
        fee: 3000,
        netAmount: 247000,
        bankName: "Mandiri",
        accountNumber: "0987654321",
        accountName: "John Doe",
        status: "PENDING",
        createdAt: "2024-12-01T14:20:00Z",
      },
    ];
    setWithdrawHistory(mockHistory);
  }, []);

  const handleAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    const net = amount - WITHDRAW_FEE;
    setFormData({ ...formData, amount: value });
    setPreview({ amount, fee: WITHDRAW_FEE, net: net > 0 ? net : 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formData.amount);
    
    if (amount < MIN_WITHDRAW) {
      toast.error(`Minimal withdraw adalah Rp ${MIN_WITHDRAW.toLocaleString()}`);
      return;
    }
    
    if (amount > balance.available) {
      toast.error("Saldo tidak mencukupi");
      return;
    }
    
    if (!formData.accountNumber || !formData.accountName) {
      toast.error("Lengkapi data rekening tujuan");
      return;
    }
    
    setShowConfirmModal(true);
  };

  const confirmWithdraw = async () => {
    setLoading(true);
    const amount = parseInt(formData.amount);
    const netAmount = amount - WITHDRAW_FEE;
    
    // Simulasi API call
    setTimeout(() => {
      const newWithdraw: WithdrawRequest = {
        id: Date.now().toString(),
        amount: amount,
        fee: WITHDRAW_FEE,
        netAmount: netAmount,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      
      setWithdrawHistory(prev => [newWithdraw, ...prev]);
      setBalance(prev => ({
        ...prev,
        available: prev.available - amount,
        withdraw: prev.withdraw + amount,
      }));
      
      toast.success(`Permintaan withdraw Rp ${amount.toLocaleString()} berhasil diajukan!`);
      setFormData({ amount: "", bankName: "BCA", accountNumber: "", accountName: "" });
      setPreview({ amount: 0, fee: 3000, net: 0 });
      setShowConfirmModal(false);
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "bg-green-500/20 text-green-400";
      case "PENDING": return "bg-yellow-500/20 text-yellow-400";
      case "PROCESSING": return "bg-blue-500/20 text-blue-400";
      case "REJECTED": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS": return <CheckCircle className="w-4 h-4" />;
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "PROCESSING": return <Clock className="w-4 h-4" />;
      case "REJECTED": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const totalWithdrawn = withdrawHistory
    .filter(w => w.status === "SUCCESS")
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingWithdraw = withdrawHistory
    .filter(w => w.status === "PENDING" || w.status === "PROCESSING")
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-gray-400 mt-1">Tarik saldo Anda ke rekening bank atau e-wallet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm">Available Balance</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(balance.available)}</p>
          <p className="text-xs text-gray-500 mt-1">Siap ditarik</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-sm">Holding Balance</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(balance.holding)}</p>
          <p className="text-xs text-gray-500 mt-1">Akan rilis dalam 24 jam</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-gray-400 text-sm">Total Withdrawn</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalWithdrawn)}</p>
          <p className="text-xs text-gray-500 mt-1">Riwayat penarikan</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Form Penarikan</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Jumlah Penarikan <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Minimal Rp 10.000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimal {formatCurrency(MIN_WITHDRAW)} | Admin fee {formatCurrency(WITHDRAW_FEE)}
              </p>
            </div>

            {preview.amount > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Jumlah Penarikan</span>
                  <span>{formatCurrency(preview.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Admin Fee</span>
                  <span className="text-red-400">{formatCurrency(preview.fee)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-white/10">
                  <span>Dana Diterima</span>
                  <span className="text-green-400">{formatCurrency(preview.net)}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Tujuan Transfer <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {banks.map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => setFormData({ ...formData, bankName: bank.code })}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition ${
                      formData.bankName === bank.code
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {bank.icon}
                    <span className="text-sm">{bank.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nomor Rekening / ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Masukkan nomor rekening/ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Pemilik Rekening <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Nama sesuai rekening"
              />
            </div>

            <button
              type="submit"
              disabled={!formData.amount || parseInt(formData.amount) < MIN_WITHDRAW}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                !formData.amount || parseInt(formData.amount) < MIN_WITHDRAW
                  ? "bg-gray-600 cursor-not-allowed"
                  : "btn-primary"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Ajukan Penarikan
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300">
                Penarikan akan diproses dalam 1x24 jam setelah admin menyetujui permintaan Anda.
                Pastikan data rekening yang Anda masukkan sudah benar.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Riwayat Penarikan</h2>
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {withdrawHistory.length > 0 ? (
              withdrawHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-400">
                        {item.bankName} - {item.accountNumber}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{item.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Fee: {formatCurrency(item.fee)}</span>
                    <span className="text-gray-400">Net: {formatCurrency(item.netAmount)}</span>
                    <span className="text-gray-500">{formatDate(item.createdAt)}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Belum ada riwayat penarikan</p>
              </div>
            )}
          </div>

          {withdrawHistory.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending Withdraw</span>
                <span className="text-yellow-400">{formatCurrency(pendingWithdraw)}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Konfirmasi Penarikan</h2>
              
              <div className="space-y-3 mb-5">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Jumlah</span>
                  <span className="font-semibold">{formatCurrency(preview.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Admin Fee</span>
                  <span className="text-red-400">{formatCurrency(preview.fee)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Dana Diterima</span>
                  <span className="font-bold text-green-400">{formatCurrency(preview.net)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Tujuan</span>
                  <span>{formData.bankName} - {formData.accountNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Atas Nama</span>
                  <span>{formData.accountName}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmWithdraw}
                  disabled={loading}
                  className="flex-1 btn-primary py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
 }
