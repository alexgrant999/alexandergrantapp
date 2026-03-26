'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-10 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-white font-bold">
            AG
          </div>
          <div>
            <p className="font-semibold text-[#e8e8f0]">Alexander Grant</p>
            <p className="text-xs text-[#6b6b8a]">Business Dashboard</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
            className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#6c63ff] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#5a52e0] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
