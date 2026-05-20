"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { roleLanding } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await register({ email, password, name });
      router.replace(roleLanding(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>Create client account</h2>
      <p className="muted small">Self-registration creates a client seat. Admin and investor seats are provisioned out-of-band.</p>
      <div className="field">
        <label>Full name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Email</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Password (8+ chars)</label>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="err">{error}</p>}
      <button className="btn-primary auth-submit" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </button>
      <p className="auth-alt">
        Already have one?{" "}
        <a href="/login" className="gold">
          Sign in
        </a>
      </p>
    </form>
  );
}
