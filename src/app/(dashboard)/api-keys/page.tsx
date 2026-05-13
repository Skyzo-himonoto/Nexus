"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Globe,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

interface ApiKey {
  id: string;
  name: string;
  publicKey: string;
  secretKey: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
}

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState<{ [key: string]: boolean }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    // Mock data - nanti diganti dengan API real
    const mockApiKeys: ApiKey[] = [
      {
        id: "1",
        name: "Production Key",
        publicKey: "pk_live_abc123def456",
        secretKey: "sk_live_xyz789uvw012",
        createdAt: "2024-11-01T00:00:00Z",
        lastUsed: "2024-12-01T10:30:00Z",
        isActive: true,
      },
      {
        id: "2",
        name: "Development Key",
        publicKey: "pk_test_def456ghi789",
        secretKey: "sk_test_uvw012xyz345",
        createdAt: "2024-11-15T00:00:00Z",
        lastUsed: null,
        isActive: true,
      },
    ];
    setApiKeys(mockApiKeys);
    setLoading(false);
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const toggleSecret = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateNewKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      publicKey: `pk_${Math.random().toString(36).substring(2, 15)}`,
      secretKey: `sk_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isActive: true,
    };

    setGeneratedKey(newKey);
    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName("");
    toast.success("New API key generated! Make sure to save your secret key.");
  };

  const deleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    toast.success("API key deleted");
  };

  const regenerateKey = (id: string) => {
    const newSecret = `sk_${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, secretKey: newSecret } : key
    ));
    toast.success("API key regenerated!");
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
          <h1 className="text-2xl md:text-3xl font-bold">API Keys</h1>
          <p className="text-gray-400 mt-1">Manage your API credentials for integration</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New API Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((key, index) => (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Key className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{key.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && (
                        <>
                          <span>•</span>
                          <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">Public Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/50 px-3 py-1.5 rounded-lg text-sm font-mono">
                      {key.publicKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.publicKey, "Public key")}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Secret Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/50 px-3 py-1.5 rounded-lg text-sm font-mono">
                      {showSecret[key.id] ? key.secretKey : "•".repeat(32)}
                    </code>
                    <button
                      onClick={() => toggleSecret(key.id)}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      {showSecret[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.secretKey, "Secret key")}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => regenerateKey(key.id)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {apiKeys.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <Key className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No API Keys Yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create your first API key to start integrating</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create API Key
            </button>
          </div>
        )}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Security Notice</h4>
            <p className="text-xs text-gray-300">
              Keep your secret keys secure! Never share them publicly or commit them to version control.
              If you suspect a key has been compromised, regenerate it immediately.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowCreateModal(false);
              setGeneratedKey(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {generatedKey ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <h2 className="text-xl font-bold">API Key Generated!</h2>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm text-yellow-400 font-semibold mb-2">Important!</p>
                    <p className="text-xs text-gray-300">
                      Make sure to copy your secret key now. You won't be able to see it again!
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Public Key</p>
                    <code className="block bg-black/50 px-3 py-2 rounded-lg text-sm font-mono break-all">
                      {generatedKey.publicKey}
                    </code>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Secret Key</p>
                    <code className="block bg-black/50 px-3 py-2 rounded-lg text-sm font-mono break-all">
                      {generatedKey.secretKey}
                    </code>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(generatedKey.publicKey, "Public key")}
                      className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      Copy Public Key
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedKey.secretKey, "Secret key")}
                      className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      Copy Secret Key
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setGeneratedKey(null);
                    }}
                    className="w-full btn-primary py-2 rounded-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Create New API Key</h2>
                  <p className="text-sm text-gray-400">
                    Give your API key a name to identify it later.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Key Name</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production Server, Mobile App"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateNewKey}
                      className="flex-1 btn-primary py-2 rounded-lg"
                    >
                      Generate Key
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
