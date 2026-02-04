"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function TestAuthPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [result, setResult] = useState("");
  const [user, setUser] = useState<any>(null);

  const testEmailSignup = async () => {
    try {
      setResult("Creating account...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setResult(`✅ SUCCESS! Created account for: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`❌ ERROR: ${error.message}`);
    }
  };

  const testEmailLogin = async () => {
    try {
      setResult("Logging in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setResult(`✅ SUCCESS! Logged in as: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`❌ ERROR: ${error.message}`);
    }
  };

  const testGoogleLogin = async () => {
    try {
      setResult("Opening Google popup...");
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      setResult(`✅ SUCCESS! Logged in as: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`❌ ERROR: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setResult("✅ Logged out successfully");
    } catch (error: any) {
      setResult(`❌ ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">🔬 Firebase Auth Test Lab</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-bold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>First, try "Create Account" with email/password</li>
            <li>Then try "Login" with the same credentials</li>
            <li>Try "Google Login" to test OAuth</li>
            <li>Check the result messages below</li>
          </ol>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={testEmailSignup}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Account
          </button>
          <button
            onClick={testEmailLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={testGoogleLogin}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 col-span-2"
          >
            Google Login
          </button>
          {user && (
            <button
              onClick={testLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 col-span-2"
            >
              Logout
            </button>
          )}
        </div>

        {result && (
          <div className={`p-4 rounded mb-4 ${result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-mono text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}

        {user && (
          <div className="p-4 bg-gray-50 border rounded">
            <h3 className="font-bold mb-2">Current User:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold mb-2">⚠️ Important:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Disable your ad blocker for localhost</li>
            <li>Check browser console for errors (F12)</li>
            <li>If you see "ERR_BLOCKED_BY_CLIENT", it's your ad blocker</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
