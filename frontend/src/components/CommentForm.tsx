'use client';

import { useState, useEffect } from 'react';
import { getComments, createComment, CommentItem } from '@/lib/api';

export default function CommentForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getComments(50);
        if (mounted) setComments(data ?? []);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const created = await createComment({ name: name.trim() || undefined, message: message.trim() });
      setComments((s) => [created, ...s]);
      setMessage('');
      setName('');
    } catch (err) {
      console.error('Failed to submit comment', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-3">ارسال نظر</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">نام (اختیاری)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="نام خود را وارد کنید یا خالی بگذارید"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">نظر شما</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="نظر یا پیشنهاد خود را اینجا بنویسید..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={!message.trim()}
          >
            ارسال نظر
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-2">نظرات اخیر</h4>
        <div className="space-y-3">
          {loading && <p className="text-sm text-gray-500 italic">در حال بارگذاری...</p>}
          {!loading && comments.length === 0 && (
            <p className="text-sm text-gray-500 italic">هنوز نظری ثبت نشده است.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="border rounded-md p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">{c.name ?? 'ناشناس'}</div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('fa-IR')}</div>
              </div>
              <div className="text-gray-800">{c.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
