"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  CreditCard, 
  QrCode, 
  Copy, 
  Download,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wallet,
  Building2,
  Smartphone
} from "lucide-react";
import toast from "react-hot-toast";

const paymentSchema = z.object({
  amount: z.number().min(1000, "Minimal amount is Rp 1,000"),
  paymentMethod: z.string().min(1, "Please select payment method"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email format"),
  customerPhone: z.string().optional(),
  note: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  callbackUrl: z.string().url().optional().or(z.literal("")),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const paymentMethods = [
  { id: "QRIS", name: "QRIS", icon: <QrCode className="w-5 h-5" />, description: "Scan QR Code with any app" },
  { id: "BCA_VA", name: "BCA Virtual Account", icon: <Building2 className="w-5 h-5" />, description: "Transfer via BCA ATM/Mobile" },
  { id: "MANDIRI_VA", name: "Mandiri Virtual Account", icon: <Building2 className="w-5 h-5" />, description: "Transfer via Mandiri ATM/Mobile" },
  { id: "BNI_VA", name: "BNI Virtual Account", icon: <Building2 className="w-5 h-5" />, description: "Transfer via BNI ATM/Mobile" },
  { id: "OVO", name: "OVO", icon: <Smartphone className="w-5 h-5" />, description: "Pay with OVO balance" },
  { id: "DANA", name: "DANA", icon: <Smartphone className="w-5 h-5" />, description: "Pay with DANA balance" },
  { id: "GOPAY", name: "GoPay", icon: <Smartphone className="w-5 h-5" />, description: "Pay with GoPay balance" },
  { id: "SHOPEEPAY", name: "ShopeePay", icon: <Smartphone className="w-5 h-5" />, description: "Pay with ShopeePay" },
];

export default function CreatePaymentPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState("QRIS");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 50000,
      paymentMethod: "QRIS",
      customerName: session?.user?.name || "",
      customerEmail: session?.user?.email || "",
    }
  });

  const amount = watch("amount");
  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    
    // Simulasi API call - nanti diganti dengan real API
    setTimeout(() => {
      const mockResult = {
        success: true,
        data: {
          transactionId: `TXN${Date.now()}`,
          invoiceCode: `INV${Date.now()}`,
          amount: data.amount,
          paymentUrl: `https://pay.nexuspedia.com/${Date.now()}`,
          qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment",
          expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
        }
      };
      setPaymentResult(mockResult.data);
      toast.success("Payment created successfully!");
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadQR = () => {
    // Download QR code simulation
    toast.success("QR Code downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Create Payment</h1>
        <p className="text-gray-400 mt-1">Generate a new payment link or QRIS code</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                <input
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter amount"
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Minimal Rp 1,000</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Method <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setValue("paymentMethod", method.id);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      paymentMethod === method.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      paymentMethod === method.id ? "bg-purple-500/20 text-purple-400" : "bg-white/10"
                    }`}>
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-xs text-gray-400">{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("customerName")}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="John Doe"
                />
                {errors.customerName && <p className="text-red-400 text-sm mt-1">{errors.customerName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Email <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("customerEmail")}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="customer@example.com"
                />
                {errors.customerEmail && <p className="text-red-400 text-sm mt-1">{errors.customerEmail.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Phone (Optional)</label>
                <input
                  {...register("customerPhone")}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="08123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                <input
                  {...register("note")}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Order #12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Redirect URL (Optional)</label>
              <input
                {...register("redirectUrl")}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="https://yourapp.com/success"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Callback URL (Optional)</label>
              <input
                {...register("callbackUrl")}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="https://yourserver.com/webhook"
              />
              <p className="text-xs text-gray-500 mt-1">We'll send payment status to this URL</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Generate Payment
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-6"
        >
          {paymentResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Payment Generated!</span>
              </div>

              {paymentMethod === "QRIS" && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl">
                    <img 
                      src={paymentResult.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono text-sm">{paymentResult.transactionId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Invoice Code</span>
                  <span className="font-mono text-sm">{paymentResult.invoiceCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold text-green-400">{formatCurrency(paymentResult.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Expired At</span>
                  <span>{new Date(paymentResult.expiredAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Status</span>
                  <span className="text-yellow-400">PENDING</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Payment URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={paymentResult.paymentUrl}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentResult.paymentUrl)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(paymentResult.paymentUrl)}
                  className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL
                </button>
                {paymentMethod === "QRIS" && (
                  <button
                    onClick={downloadQR}
                    className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </button>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-300">
                    Payment will be held for 24 hours after successful payment for security purposes.
                    Funds will be automatically released to your available balance after holding period.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Create Payment</h3>
              <p className="text-gray-400 text-sm">
                Fill in the payment details on the left form to generate a payment link or QR code.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
  }
