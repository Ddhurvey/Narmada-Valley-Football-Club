"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import { createNewsArticle, CATEGORIES } from "@/lib/news";

const toolOptions = [
  { value: "club_report", label: "Club Report" },
  { value: "match_report", label: "Match Report" },
  { value: "news_draft", label: "News Draft" },
  { value: "social_caption", label: "Social Caption" },
  { value: "sponsor_update", label: "Sponsor Update" },
  { value: "training_summary", label: "Training Summary" },
];

type AiOutputDoc = {
  id: string;
  tool: string;
  language: "en" | "hi";
  title?: string;
  input: string;
  result: string;
  createdAt?: { toDate: () => Date };
};

export default function AdminAiToolsPage() {
  const { user, profile, isAdmin } = useAuth();
  const [tool, setTool] = React.useState<string>("club_report");
  const [language, setLanguage] = React.useState<"en" | "hi">("en");
  const [title, setTitle] = React.useState<string>("");
  const [input, setInput] = React.useState<string>("");
  const [result, setResult] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [autoSave, setAutoSave] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string>("");
  const [recentOutputs, setRecentOutputs] = React.useState<AiOutputDoc[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const loadRecentOutputs = React.useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const outputsQuery = query(
        collection(db, "aiOutputs"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(outputsQuery);
      const outputs = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<AiOutputDoc, "id">),
      }));
      setRecentOutputs(outputs);
    } catch (err) {
      console.error("Failed to load AI outputs", err);
    }
  }, [user, isAdmin]);

  React.useEffect(() => {
    loadRecentOutputs();
  }, [loadRecentOutputs]);

  const saveOutput = async (outputText: string) => {
    if (!user || !isAdmin || !outputText) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      await addDoc(collection(db, "aiOutputs"), {
        userId: user.uid,
        userName:
          profile?.displayName || user.displayName || user.email || "Unknown",
        tool,
        language,
        title: title?.trim() || null,
        input,
        result: outputText,
        createdAt: serverTimestamp(),
      });
      setSaveMessage("Saved to library.");
      await loadRecentOutputs();
    } catch (err) {
      console.error("Failed to save AI output", err);
      setSaveMessage("Save failed. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    setError("");
    setResult("");

    if (!input.trim()) {
      setError("Please provide input details.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          language,
          input: title ? `Title: ${title}\n${input}` : input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = data?.details ? ` ${data.details}` : "";
        setError(`${data?.error || "Something went wrong."}${details}`.trim());
        return;
      }

      const outputText = data?.result || "No output generated.";
      setResult(outputText);
      if (autoSave) {
        await saveOutput(outputText);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to generate content. ${message}`.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setSaveMessage("Copied to clipboard.");
  };

  const handleEmail = () => {
    if (!result) return;
    const subject = encodeURIComponent(title || "AI Output");
    const body = encodeURIComponent(result);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const header = title || toolOptions.find((opt) => opt.value === tool)?.label || "AI Output";
    doc.setFontSize(14);
    doc.text(header, 10, 12);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(result, 180);
    doc.text(lines, 10, 22);
    doc.save(`${header.replace(/\s+/g, "-").toLowerCase()}-output.pdf`);
  };

  const handlePublishNews = async () => {
    if (!result || !title.trim()) {
      setSaveMessage("Title is required to publish news.");
      return;
    }

    setIsPublishing(true);
    setSaveMessage("");
    try {
      const excerpt = result
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);

      const publishResult = await createNewsArticle({
        title: title.trim(),
        excerpt,
        content: result.trim(),
        image: "",
        category: CATEGORIES.includes("Club News") ? "Club News" : CATEGORIES[0],
        author: profile?.displayName || user?.displayName || "NVFC Media Team",
        isPublished: true,
      });

      if (publishResult.success) {
        setSaveMessage("Published to News.");
      } else {
        setSaveMessage(`Publish failed: ${publishResult.error || "Unknown error"}`);
      }
    } catch (err) {
      setSaveMessage("Publish failed. Try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom space-y-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-nvfc-dark mb-2">AI Tools</h1>
          <p className="text-gray-600">
            Generate reports, drafts, and social captions using Google AI Studio.
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tool</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nvfc-primary focus:border-transparent"
                value={tool}
                onChange={(event) => setTool(event.target.value)}
              >
                {toolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nvfc-primary focus:border-transparent"
                value={language}
                onChange={(event) => setLanguage(event.target.value as "en" | "hi")}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <Input
              label="Title (optional)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: March 2026 Club Report"
            />

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(event) => setAutoSave(event.target.checked)}
              />
              Auto-save output to library
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Input Details</label>
              <textarea
                className="w-full min-h-[220px] px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nvfc-primary focus:border-transparent"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Add key points, stats, or raw notes here..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {saveMessage && <p className="text-sm text-gray-600">{saveMessage}</p>}

            <Button onClick={handleGenerate} isLoading={isLoading}>
              Generate
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-nvfc-dark mb-4">Generated Output</h2>
            {result ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {result}
              </pre>
            ) : (
              <div className="text-gray-500 text-sm">
                Output will appear here after generation.
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => saveOutput(result)}
                isLoading={isSaving}
                disabled={!result}
              >
                Save to Library
              </Button>
              <Button
                variant="primary"
                onClick={handlePublishNews}
                isLoading={isPublishing}
                disabled={!result}
              >
                Publish as News
              </Button>
              <Button variant="outline" onClick={handleCopy} disabled={!result}>
                Copy
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!result}>
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleEmail} disabled={!result}>
                Email
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-nvfc-dark mb-4">Recent Saved Outputs</h2>
          {recentOutputs.length === 0 ? (
            <div className="text-sm text-gray-500">No saved outputs yet.</div>
          ) : (
            <div className="space-y-3">
              {recentOutputs.map((output) => (
                <div
                  key={output.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="text-sm text-gray-500">
                      {toolOptions.find((opt) => opt.value === output.tool)?.label || output.tool}
                    </div>
                    <div className="font-semibold text-nvfc-dark">
                      {output.title || "Untitled"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {output.createdAt?.toDate
                        ? output.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTool(output.tool);
                        setLanguage(output.language);
                        setTitle(output.title || "");
                        setInput(output.input);
                        setResult(output.result);
                      }}
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-nvfc-dark mb-4">Suggested Uses</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Monthly or weekly club performance report for management.</li>
            <li>Match report drafts from coach notes and match stats.</li>
            <li>News article draft for website publishing.</li>
            <li>Social media captions for fixtures, wins, and events.</li>
            <li>Sponsor update summaries with impact highlights.</li>
            <li>Training session recap for coaches and staff.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
