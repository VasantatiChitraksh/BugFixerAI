const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = 'AIzaSyDMcPMqA70msaMFXDZLIVmeJcm64WnD6YI';

let panel = undefined;
let changeCounter = 0;

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
          if (msg.command === 'acceptFixes') {
            console.log("Received message from webview:", msg);
            
            const editors = vscode.window.visibleTextEditors;
            if (editors.length === 0) {
              vscode.window.showErrorMessage("No editor is open.");
              return;
            }

            const editor = editors[0]; // fallback to first open editor
            await vscode.window.showTextDocument(editor.document, vscode.ViewColumn.One, false);
            if (!editor){
              console.log("Editor is null");
              return;
            } 
          
            const fixedCode = (msg.fixedText || '').split('\n').slice(1).join('\n');
            console.log("Fixed Code : ", fixedCode);
            if (editor.document.getText() === fixedCode) {
              vscode.window.showInformationMessage("No changes detected. Already up to date.");
              return;
            }
            
            const entireRange = new vscode.Range(
              editor.document.positionAt(0),
              editor.document.positionAt(editor.document.getText().length)
            );
          
            const success = await editor.edit(editBuilder => {
              editBuilder.replace(entireRange, fixedCode);
            });
          
            if (success) {
              vscode.window.showInformationMessage('Code updated with fixes!');
            } else {
              vscode.window.showErrorMessage('Edit operation failed.');
            }
          } else if (msg.command === 'declineFixes') {
            vscode.window.showInformationMessage('Fixes declined.');
          }
        });
        
        vscode.workspace.onDidChangeTextDocument(event => {
          const editor = vscode.window.activeTextEditor;
          if (!editor || event.document !== editor.document) return;
      
          for (const change of event.contentChanges) {
            changeCounter += change.text.split('\n').length - 1;
          }
      
          if (changeCounter >= 5) {
            changeCounter = 0;
            triggerAnalysis();
          }
        });

        panel.onDidDispose(() => {
          panel = undefined;
        });
      }
    })
  );

  vscode.commands.executeCommand('extension.activateAnalyzer');
}

function triggerAnalysis() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    panel?.webview.postMessage({ command: 'display', content: 'No active file open.' });
    return;
  }

  panel?.webview.postMessage({ command: 'display', content: 'Analyzing...' });

  const content = editor.document.getText();
  analyzeCodeWithPathCheck(content).then(analysis => {
    panel?.webview.postMessage({ command: 'display', content: analysis });
  });
}

async function analyzeCodeWithPathCheck(code) {
  const analysis = await analyzeCode(code);
  const pathWarnings = await analyzeFilePaths(code);

  if (pathWarnings) {
    return `${analysis}\n\n⚠️ File Path Issues Detected:\n${pathWarnings}`;
  }

  return analysis;
}

async function analyzeCode(code) {
  const prompt = `Analyze the following code line by line.  Analyze the code for the following issues:

1. Syntax errors  
2. Logical issues  
3. Performance problems  
4. Violations of coding best practices (readability, efficiency, maintainability)

Use that analysis to fix the given code and provide the fixed and correct code line by line. Don't provide:
1. Analysis
2. Comments
3. Fixes
4. Language of the code

Provide just the fixed code. 

In case of no issue, provide the same given code. 

Here is the code to fix:\n\n${code}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    let extractedText = response.data.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "";

    let lines = extractedText.split('\n');

    if (lines[0]?.trim().toLowerCase() === "python") {
      lines.shift();
    }
    
    extractedText = lines.join('\n');

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

async function analyzeFilePaths(code) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) return '';

  const rootPath = workspaceFolders[0].uri.fsPath;
  const pathRegex = /(?:require\(|import .*? from |fs\.(?:readFileSync|readFile|existsSync|openSync|writeFileSync)\()(['"])([^'"]+)\1/g;

  const warnings = new Set();
  let match;

  while ((match = pathRegex.exec(code)) !== null) {
    const relativePath = match[2];

    if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) continue;

    const absolutePath = path.resolve(rootPath, relativePath);
    const possiblePaths = [
      absolutePath,
      `${absolutePath}.js`,
      `${absolutePath}.ts`,
      `${absolutePath}.json`,
      path.join(absolutePath, 'index.js'),
    ];

    const fileExists = possiblePaths.some(fs.existsSync);

    if (!fileExists) {
      warnings.add(`- Path "${relativePath}" does not exist relative to the project root.`);
    }
  }

  return [...warnings].join('\n');
}


function getInitialHtml() {
  return `<!DOCTYPE html>
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
      font-family: sans-serif;
      padding: 1.5rem;
      margin: 0;
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
      margin-bottom: 1rem;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      padding: 0.4rem 0.8rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .accept {
      background-color: var(--button-bg-light);
      color: white;
    }

    .accept:hover {
      background-color: var(--button-hover-light);
    }

    .decline {
      background-color: #e81123;
      color: white;
    }

    .decline:hover {
      background-color: #c50f1f;
    }

    .output-container {
      position: relative;
    }

    pre {
      padding: 1rem;
      border-radius: 6px;
      background-color: var(--pre-bg-light);
      border: 1px solid var(--pre-border-light);
      white-space: pre-wrap;
    }

    .dark-mode pre {
      background-color: var(--pre-bg-dark);
      border-color: var(--pre-border-dark);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .slider {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 28px;
      background-color: #ccc;
      border-radius: 34px;
    }

    .slider:before {
      content: "";
      position: absolute;
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider:before {
      transform: translateX(32px);
    }

    input {
      display: none;
    }
  </style>
</head>
<body class="light-mode">
  <div class="container">
    <div class="header">
      <h1 class="title">Code Analysis Tool</h1>
      <div class="theme-toggle">
        <input type="checkbox" id="themeToggle" onchange="toggleTheme()">
        <span class="slider"></span>
      </div>
    </div>

    <div class="buttons">
      <button class="action-button accept" onclick="acceptFixes()">Accept Fixes</button>
      <button class="action-button decline" onclick="declineFixes()">Decline Fixes</button>
    </div>

    <div class="output-container">
      <pre id="output">Code analysis will appear here automatically every 2 lines changed.</pre>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'display') {
        document.getElementById('output').innerText = message.content;
      }
    });

    function toggleTheme() {
      const body = document.body;
      body.classList.toggle('dark-mode');
      body.classList.toggle('light-mode');
    }

    function acceptFixes() {
      const fixedText = document.getElementById('output').innerText;
      console.log("Sending fixed code to extension:", fixedText);
      vscode.postMessage({ command: 'acceptFixes', fixedText });
    }


    function declineFixes() {
      vscode.postMessage({ command: 'declineFixes' });
    }
  </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
