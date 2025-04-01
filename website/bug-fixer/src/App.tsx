import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Code2, FileJson } from 'lucide-react';

function App() {
  const [code, setCode] = useState('// Write your code here...');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        code: code,
        timestamp: new Date().toISOString(),
      };

      // Here you would typically send to your backend
      // For now, we'll just show the JSON output
      setOutput(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setOutput('Error processing code');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold">Code Editor</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-2 flex justify-between items-center">
              <span className="text-sm text-gray-400">Editor</span>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Processing...' : 'Send Code'}
              </button>
            </div>
            <div className="h-[500px]">
              <Editor
                height="100%"
                defaultLanguage="javascript"
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

          {/* Output Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="border-b border-gray-700 p-2 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">JSON Output</span>
            </div>
            <pre className="p-4 h-[500px] overflow-auto">
              <code>{output}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;