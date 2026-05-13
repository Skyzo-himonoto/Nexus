"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Send,
  Play,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastSent: string | null;
  createdAt: string;
}

const availableEvents = [
  { value: "payment.success", label: "Payment Success", description: "When payment is successful" },
  { value: "payment.failed", label: "Payment Failed", description: "When payment fails" },
  { value: "payment.holding", label: "Payment Holding", description: "When payment enters holding period" },
  { value: "balance.released", label: "Balance Released", description: "When holding balance is released" },
  { value: "withdraw.success", label: "Withdraw Success", description: "When withdraw is approved" },
  { value: "withdraw.rejected", label: "Withdraw Rejected", description: "When withdraw is rejected" },
];

export default function WebhookPage() {
  const { data: session } = useSession();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Mock data - nanti diganti dengan API real
    const mockWebhooks: WebhookConfig[] = [
      {
        id: "1",
        url: "https://api.yourdomain.com/webhook/payment",
        events: ["payment.success", "payment.failed"],
        isActive: true,
        secret: "whsec_abc123def456",
        lastSent: "2024-12-01T10:30:00Z",
        createdAt: "2024-11-01T00:00:00Z",
      },
    ];
    setWebhooks(mockWebhooks);
    setLoading(false);
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const generateSecret = () => {
    return `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`;
  };

  const saveWebhook = (data: Partial<WebhookConfig>) => {
    if (editingWebhook) {
      setWebhooks(prev => prev.map(w => 
        w.id === editingWebhook.id ? { ...w, ...data } as WebhookConfig : w
      ));
      toast.success("Webhook updated successfully!");
    } else {
      const newWebhook: WebhookConfig = {
        id: Date.now().toString(),
        url: data.url || "",
        events: data.events || [],
        isActive: true,
        secret: generateSecret(),
        lastSent: null,
        createdAt: new Date().toISOString(),
      };
      setWebhooks(prev => [newWebhook, ...prev]);
      toast.success("Webhook created successfully!");
    }
    setShowCreateModal(false);
    setEditingWebhook(null);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success("Webhook deleted!");
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
    toast.success("Webhook status updated!");
  };

  const testWebhook = async (url: string) => {
    setTesting(true);
    setTestResult(null);
    
    // Simulasi test webhook
    setTimeout(() => {
      setTestResult({
        success: true,
        message: "Webhook test successful! Your endpoint received the test payload.",
      });
      setTesting(false);
      toast.success("Test webhook sent!");
    }, 2000);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Webhooks</h1>
          <p className="text-gray-400 mt-1">Configure webhook endpoints for real-time notifications</p>
        </div>
        <button
          onClick={() => {
            setEditingWebhook(null);
            setShowCreateModal(true);
          }}
          className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook, index) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${webhook.isActive ? "bg-green-500/20" : "bg-gray-500/20"}`}>
                    <WebhookIcon className={`w-5 h-5 ${webhook.isActive ? "text-green-400" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{webhook.url}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${webhook.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {webhook.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                      <span>Secret: {webhook.secret.substring(0, 10)}...</span>
                      {webhook.lastSent && (
                        <>
                          <span>•</span>
                          <span>Last sent: {new Date(webhook.lastSent).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {webhook.events.map(event => {
                    const eventInfo = availableEvents.find(e => e.value === event);
                    return (
                      <span key={event} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                        {eventInfo?.label || event}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => testWebhook(webhook.url)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  title="Test Webhook"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWebhook(webhook.id)}
                  className={`p-2 rounded-lg transition ${
                    webhook.isActive ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400" : "bg-green-500/10 hover:bg-green-500/20 text-green-400"
                  }`}
                  title={webhook.isActive ? "Deactivate" : "Activate"}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingWebhook(webhook);
                    setShowCreateModal(true);
                  }}
                  className="p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition text-blue-400"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {webhooks.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <WebhookIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Webhooks Configured</h3>
            <p className="text-gray-400 text-sm mb-4">Add a webhook endpoint to receive real-time payment notifications</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Webhook Documentation</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">How Webhooks Work</h4>
            <p className="text-sm text-gray-400">
              Webhooks allow your application to receive real-time notifications when events occur.
              When an event is triggered, we'll send an HTTP POST request to your configured endpoint.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Event Types</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-2 text-left">Event</th>
                    <th className="p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {availableEvents.map(event => (
                    <tr key={event.value} className="border-b border-white/10">
                      <td className="p-2 font-mono text-xs text-purple-400">{event.value}</td>
                      <td className="p-2 text-gray-400 text-xs">{event.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Sample Payload</h4>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs text-cyan-400">
              <code>{`{
  "event": "payment.success",
  "transactionId": "TXN20241201001",
  "amount": 50000,
  "status": "SUCCESS",
  "timestamp": "2024-12-01T10:30:00Z",
  "customer": {
    "name": "mariana",
    "email": "mariana"
  }
}`}</code>
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Security</h4>
            <p className="text-sm text-gray-400">
              Each webhook request includes a signature in the <code className="text-purple-400">X-Webhook-Signature</code> header.
              Use your webhook secret to verify the payload authenticity.
            </p>
          </div>
        </div>
      </div>

      {testResult && (
        <div className={`fixed bottom-4 right-4 glass-card rounded-xl p-4 max-w-sm z-50 ${
          testResult.success ? "border-green-500/30" : "border-red-500/30"
        }`}>
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium">{testResult.success ? "Success!" : "Failed!"}</p>
              <p className="text-xs text-gray-400">{testResult.message}</p>
            </div>
            <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      <WebhookModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingWebhook(null);
        }}
        onSave={saveWebhook}
        editingWebhook={editingWebhook}
        availableEvents={availableEvents}
      />
    </div>
  );
}

function WebhookModal({ isOpen, onClose, onSave, editingWebhook, availableEvents }: any) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    if (editingWebhook) {
      setUrl(editingWebhook.url);
      setSelectedEvents(editingWebhook.events);
    } else {
      setUrl("");
      setSelectedEvents([]);
    }
  }, [editingWebhook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter webhook URL");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }
    onSave({ url, events: selectedEvents });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card rounded-xl p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {editingWebhook ? "Edit Webhook" : "Create Webhook"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Endpoint URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourdomain.com/webhook"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send POST requests to this URL when events occur
            </p>
          </div>

          {/* Events */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Events to Receive <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableEvents.map((event: any) => (
                <label
                  key={event.value}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{event.label}</p>
                    <p className="text-xs text-gray-400">{event.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-2 rounded-lg"
            >
              {editingWebhook ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
 }
