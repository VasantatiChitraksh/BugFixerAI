// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// const vscode = require('vscode');

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed

// /**
//  * @param {vscode.ExtensionContext} context
//  */

// vscode.window.showInformationMessage('🔥 EXTENSION LOADED 🔥');

// function activate(context) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "extension" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with  registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
// 		// The code you place here will be executed every time your command is executed

// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from vscode_extension!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// function deactivate() {}

// module.exports = {
// 	activate,
// 	deactivate
// }
const vscode = require('vscode');
const axios = require('axios');

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = 'AIzaSyDlCGWlX5o7I9nDF8kEtqORgfQQqp0Fwbo';

let panel = undefined;

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.activateAnalyzer', () => {
      if (panel) {
        panel.reveal(vscode.ViewColumn.Beside);
      } else {
        panel = vscode.window.createWebviewPanel(
          'codeAnalyzer',
          'Code Analyzer',
          vscode.ViewColumn.Beside,
          { enableScripts: true }
        );

        panel.webview.html = getInitialHtml();

        panel.webview.onDidReceiveMessage(async (msg) => {
          if (msg.command === 'analyze') {
            const editor = vscode.window.visibleTextEditors.find(
              e => e.viewColumn === vscode.ViewColumn.One
            );

            if (!editor) {
              panel?.webview.postMessage({ command: 'display', content: 'No active file open.' });
              return;
            } else {
              panel?.webview.postMessage({ command: 'display', content: 'Analyzing...' });
            }

            const content = editor.document.getText();
            const analysis = await analyzeCode(content);
            panel?.webview.postMessage({ command: 'display', content: analysis });
          }
        });

        panel.onDidDispose(() => {
          panel = undefined;
        });
      }
    })
  );

  // Optional: Activate panel on VS Code startup
  vscode.commands.executeCommand('extension.activateAnalyzer');
}

async function analyzeCode(code) {
  const prompt = `Analyze the following code for errors, best practices, and optimizations. Format the response in simple, structured sentences without Markdown symbols:\n\n${code}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    let extractedText =
      response.data.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ") || "";

    extractedText = extractedText
      .replace(/[*#`]/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return extractedText;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Error analyzing code.";
  }
}

function getInitialHtml() {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg-light: #ffffff;
      --text-light: #333333;
      --button-bg-light: #0078d4;
      --button-hover-light: #106ebe;
      --pre-bg-light: #f3f3f3;
      --pre-border-light: #e0e0e0;
      
      --bg-dark: #1e1e1e;
      --text-dark: #e0e0e0;
      --button-bg-dark: #0e639c;
      --button-hover-dark: #1177bb;
      --pre-bg-dark: #252526;
      --pre-border-dark: #3c3c3c;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      padding: 1.5rem;
      line-height: 1.5;
      margin: 0;
      transition: background-color 0.3s, color 0.3s;
    }
    
    body.light-mode {
      background-color: var(--bg-light);
      color: var(--text-light);
    }
    
    body.dark-mode {
      background-color: var(--bg-dark);
      color: var(--text-dark);
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }
    
    .button-group {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    
    button.primary {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }
    
    button.primary:hover {
      transform: translateY(-1px);
    }
    
    button.primary:active {
      transform: translateY(0);
    }
    
    .light-mode button.primary {
      background-color: var(--button-bg-light);
      color: white;
    }
    
    .light-mode button.primary:hover {
      background-color: var(--button-hover-light);
    }
    
    .dark-mode button.primary {
      background-color: var(--button-bg-dark);
      color: white;
    }
    
    .dark-mode button.primary:hover {
      background-color: var(--button-hover-dark);
    }
    
    /* Theme toggle slider */
    .theme-toggle {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 28px;
    }
    
    .theme-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
    }
    
    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
      z-index: 2;
    }
    
    input:checked + .slider {
      background-color: #2c2c2c;
    }
    
    input:checked + .slider:before {
      transform: translateX(32px);
    }
    
    .dark-icon, .light-icon {
      color: white;
      font-size: 14px;
      z-index: 1;
    }
    
    pre {
      margin-top: 1rem;
      padding: 1.25rem;
      border-radius: 6px;
      font-family: 'SF Mono', Monaco, Menlo, Consolas, 'Courier New', monospace;
      font-size: 0.9rem;
      overflow: auto;
      white-space: pre-wrap;
      transition: background-color 0.3s, border-color 0.3s;
    }
    
    .light-mode pre {
      background-color: var(--pre-bg-light);
      border: 1px solid var(--pre-border-light);
    }
    
    .dark-mode pre {
      background-color: var(--pre-bg-dark);
      border: 1px solid var(--pre-border-dark);
    }
    
    .output-container {
      position: relative;
    }
    
    .status-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    .light-mode .status-indicator {
      background-color: #888;
    }
    
    .dark-mode .status-indicator {
      background-color: #aaa;
    }
  </style>
</head>
<body class="light-mode">
  <div class="container">
    <div class="header">
      <h1 class="title">Code Analysis Tool</h1>
      <div class="button-group">
        <button onclick="analyze()" class="primary">Analyze Code</button>
        <label class="theme-toggle">
          <input type="checkbox" id="themeToggle" onchange="toggleTheme()">
          <span class="slider">
            <span class="light-icon">☀️</span>
            <span class="dark-icon">🌙</span>
          </span>
        </label>
      </div>
    </div>
    
    <div class="output-container">
      <span class="status-indicator"></span>
      <pre id="output">Click "Analyze Code" to see the analysis results here.</pre>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function analyze() {
      vscode.postMessage({ command: 'analyze' });
    }
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'display') {
        document.getElementById('output').innerText = message.content;
      }
    });
    
    function toggleTheme() {
      const body = document.body;
      if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
      } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
      }
    }
  </script>
</body>
</html>
  `;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
