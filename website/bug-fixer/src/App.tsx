"use client";
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Code2, FileJson, Brain, Bug, X } from 'lucide-react';

const languageOptions = [
  { name: 'C', value: 50 },
  { name: 'C++', value: 54 },
  { name: 'Java', value: 62 },
  { name: 'Python', value: 71 },
];

function App() {
  const [code, setCode] = useState('// Write your code here...');
  const [stdin, setStdin] = useState(''); // ✅ new state for input
  const [output, setOutput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [language, setLanguage] = useState(54);
  const [debugging, setDebugging] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugOutput, setDebugOutput] = useState('');

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setCode(value);
  };

  const handleLanguageChange = (event: { target: { value: any } }) => {
    setLanguage(Number(event.target.value));
  };

  const handleDebug = async () => {
    setDebugging(true);
    setDebugOutput('');
    setShowDebugPanel(true);
    try {
      const response = await fetch("/api/debugCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      let raw = data.output || data.error || 'No output received';
      let split = raw.split("### Output Code:");
      let out = (split.length > 1 ? split[1] : raw)
        .replace(/[*#`]/g, "")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      if (data.output) {
        setDebugOutput(out);
        setShowDebugPanel(true);
      } else {
        console.error("[ERROR] No output received:", data);
        setOutput("⚠️ No output received from the server.");
      }
    } catch (error) {
      console.error("[ERROR] Fetch failed:", error);
      setOutput("🚨 Error fetching from server.");
    } finally {
      setDebugging(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setOutput('');

    try {
      const response = await fetch('/api/submitCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language_id: language, stdin }), // ✅ pass input here
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        setOutput('Error processing code');
        return;
      }

      const result = await response.json();
      setOutput(result.stdout || result.stderr || 'No output');
    } catch (error) {
      console.error('Request Error:', error);
      setOutput('Error processing code');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis('');

    try {
      const response = await fetch('/api/analyseCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Analysis Error:', errorText);
        setAnalysis('Error analyzing code');
        return;
      }

      const result = await response.json();
      setAnalysis(result.analysis || 'No issues detected. Your code looks good!');
    } catch (error) {
      console.error('Request Error:', error);
      setAnalysis('Error analyzing code');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold">BugFixerAI</h1>
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mr-2">Select Language:</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-800 text-white px-3 py-2 rounded-md"
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm block mb-1">Input (stdin):</label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            className="w-full bg-gray-800 text-white p-2 rounded-md resize-none"
            rows={4}
            placeholder="Enter input for your program here..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-2 flex justify-between items-center">
              <span className="text-sm text-gray-400">Editor</span>
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-md transition-colors disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  {analyzing ? 'Analyzing...' : 'AI Analyse'}
                </button>
                <button
                  onClick={handleDebug}
                  disabled={debugging}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
                >
                  <Bug className="w-4 h-4" />
                  {debugging ? 'Debugging...' : 'Debug Code'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>
            <div className="h-[500px]">
              <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 10 },
                }}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-2 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Output</span>
            </div>
            <pre className="p-4 h-[250px] overflow-auto">
              <code>{output || 'Waiting for output...'}</code>
            </pre>
            <div className="border-t border-gray-700 p-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">AI Analysis</span>
            </div>
            <pre className="p-4 h-[250px] overflow-auto">
              <code>{analysis || 'Waiting for analysis...'}</code>
            </pre>
          </div>
        </div>

        {showDebugPanel && (
          <div className="absolute right-0 top-0 w-96 bg-gray-800 h-full p-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-sm text-gray-400">Debug Console</span>
              <X className="w-4 h-4 cursor-pointer" onClick={() => setShowDebugPanel(false)} />
            </div>
            <pre className="p-4 overflow-auto">
              <code>{debugOutput || 'Waiting for debug output...'}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
