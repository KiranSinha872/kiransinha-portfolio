'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '@/lib/services/firestore';
import type { ContactMessage } from '@/lib/services/contact';
import { useToast } from '@/components/ui/Toast';
import type { SocialLink } from '@/types';
import {
  Mail,
  Phone,
  Plus,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  CheckCircle,
  Clock,
  Inbox,
} from 'lucide-react';

const COMMON_PLATFORMS = [
  'LinkedIn',
  'GitHub',
  'LeetCode',
  'CodeChef',
  'Codeforces',
  'Twitter',
  'YouTube',
  'Medium',
  'Website',
  'Email',
];

export default function ContactManager() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [socials, setSocials] = useState<SocialLink[]>([]);

  // Inbound Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const list = await getContactMessages();
      setMessages(list);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData] = await Promise.all([
          getProfile(),
          fetchMessages(),
        ]);
        if (profileData) {
          setEmail(profileData.email || profileData.contactEmail || '');
          setPhone(profileData.phone || '');
          setSocials(profileData.socials || []);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
        showToast('error', 'Failed to load contact information.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast, fetchMessages]);

  const handleToggleRead = async (msg: ContactMessage) => {
    if (!msg.id) return;
    const nextRead = !msg.read;
    try {
      await markContactMessageRead(msg.id, nextRead);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m))
      );
      showToast('success', nextRead ? 'Message marked as read' : 'Message marked as unread');
    } catch (err) {
      console.error('Toggle read error:', err);
      showToast('error', 'Failed to update message status');
    }
  };

  const handleDeleteMessage = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('success', 'Message deleted');
    } catch (err) {
      console.error('Delete message error:', err);
      showToast('error', 'Failed to delete message');
    }
  };

  const handleAddSocial = () => {
    setSocials((prev) => [
      ...prev,
      { platform: 'LinkedIn', url: 'https://', label: '' },
    ]);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSocialChange = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    setSocials((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        email: email.trim(),
        contactEmail: email.trim(),
        phone: phone.trim(),
        socials: socials.filter((s) => s.url.trim() !== ''),
      });
      showToast('success', 'Contact info & social links saved to Firestore!');
    } catch (err) {
      console.error('Save contact info error:', err);
      showToast('error', 'Failed to update contact info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-lg font-bold text-gray-900">Contact Info & Social Links</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure direct communication channels and links to your professional profiles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Direct Contact Fields */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-3">
          <h3 className="text-xs font-semibold text-gray-800">Direct Communication</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Primary Contact Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@kiransinha.dev"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Phone / WhatsApp (Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-gray-800">
                Social Profiles & Portals
              </h3>
              <p className="text-[11px] text-gray-500">
                Visible as links on the public contact section and footer.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSocial}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 bg-white text-gray-700 text-xs rounded hover:bg-gray-100"
            >
              <Plus className="w-3 h-3" />
              <span>Add Link</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {socials.map((social, idx) => (
              <div
                key={idx}
                className="p-3 border border-gray-200 rounded bg-white flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="w-full sm:w-36">
                  <select
                    value={social.platform}
                    onChange={(e) =>
                      handleSocialChange(idx, 'platform', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
                  >
                    {COMMON_PLATFORMS.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="url"
                    required
                    value={social.url}
                    onChange={(e) =>
                      handleSocialChange(idx, 'url', e.target.value)
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 font-mono"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <input
                    type="text"
                    value={social.label || ''}
                    onChange={(e) =>
                      handleSocialChange(idx, 'label', e.target.value)
                    }
                    placeholder="Display label"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSocial(idx)}
                  className="p-1 text-red-600 hover:text-red-800 self-end sm:self-center"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {socials.length === 0 && (
              <p className="text-xs text-gray-500 italic py-1">
                No social links added yet. Click &quot;Add Link&quot; above.
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Contact Details</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Inbound Visitor Messages Section */}
      <div className="pt-8 border-t border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-bold text-gray-900">
              Inbound Messages
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {messages.length} total • {messages.filter((m) => !m.read).length} unread
            </span>
          </div>

          <button
            type="button"
            onClick={fetchMessages}
            disabled={loadingMessages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingMessages ? (
          <div className="p-8 flex justify-center items-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-xs text-gray-500">
            No inbound messages received yet.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg border transition-all ${
                  msg.read
                    ? 'bg-white border-gray-200 text-gray-700'
                    : 'bg-emerald-50/40 border-emerald-200 text-gray-900 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-gray-900">
                      {msg.name}
                    </span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      &lt;{msg.email}&gt;
                    </a>
                    {!msg.read && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                        New
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {typeof msg.createdAt === 'string'
                        ? new Date(msg.createdAt).toLocaleString()
                        : 'Recent'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleRead(msg)}
                      className="hover:text-emerald-700 transition-colors cursor-pointer"
                      title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <CheckCircle className={`w-4 h-4 ${msg.read ? 'text-gray-400' : 'text-emerald-600'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
