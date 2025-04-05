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
      <style>
        body {
          font-family: sans-serif;
          padding: 1rem;
          background: #f9f9f9;
        }
        button {
          padding: 0.5rem 1rem;
          margin-right: 0.5rem;
          background: #007acc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        pre {
          margin-top: 1rem;
          background: #eee;
          padding: 1rem;
          border-radius: 6px;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <button onclick="analyze()">Analyze Code</button>
      
      <pre id="output">Click "Analyze Code" to see the analysis here.</pre>

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
