# BugFixerAI

BugFixerAI is an innovative tool that leverages Large Language Models (LLMs) to identify and fix bugs in code across multiple programming languages. The project consists of two main components:

- **Web-based Interface:**  
  Provides an interactive environment to compile, analyze, and debug code.  
- **VSCode Extension:**  
  Automatically detects and repairs runtime bugs (e.g., path errors, segmentation faults, logical flaws) using LLM-based insights.

The primary goal of BugFixerAI is to offer a seamless debugging experience, enabling both manual and automatic code repair with high precision.

---

## Features Implemented in Release-1

### Website

- **Multilingual Online Compiler:**  
  Write, execute, and test code in multiple languages directly from the browser with fast, reliable output—ideal for hands-on learning and prototyping.

- **Intelligent Code Analyser:**  
  Interprets code logic to detect potential issues such as logical errors, bad practices, or edge cases before they become bugs, while explaining the reasons behind these issues.

- **Interactive Debugger (LLM-Powered):**  
  Connects to a local LLM-based API, acting as an intelligent code companion that helps users fix bugs and explore alternative implementations.


### VSCode Extension

- **On-the-Fly Static Code Analysis:**  
  Integrates directly into VSCode to automatically analyze the active file, highlighting inefficiencies, bad practices, and hidden bugs without switching contexts.

- **Context-Aware File Detection:**  
  Automatically recognizes and analyses the open file based on its language and structure, providing dynamic insights and intelligent suggestions.

---

## Methodology

The development of BugFixerAI followed a structured and research-backed approach to ensure clarity, collaboration, and consistent progress:

1. **Research and Ideation:**  
   - Conducted extensive literature reviews on Automatic Program Repair (APR), LLM-assisted debugging, and code analysis.  
   - Identified gaps in existing tools, inspiring a modular design that combines manual intervention with automated debugging.

2. **Design and Planning:**  
   - Created a flowchart-based architecture for the VSCode extension outlining key stages:  
     - **Code Parsing:** Syntax and semantic analysis  
     - **Code Analysis:** Identification of anomalies, static bugs, or logical errors  
     - **Bug Detection & Suggestion:** Leveraging LLMs to propose fixes  
     - **Code Replacement:** Safely integrating corrections  
   - Divided work based on clear feature prioritization.

3. **Agile Development Using Scrum:**  
   - Daily standups, weekly sprints, and retrospectives ensured team alignment and momentum.  
   - Continuous Integration was adopted via GitHub, Notion/Docs, and local GPU clusters for testing.

4. **Testing and Iteration:**  
   - Continuous evaluation of LLM outputs against known bugs ensured reliability.  
   - The custom API was benchmarked for performance (accuracy vs. latency), and usability tests refined the frontend experience.

---

## Techniques and Implementation

1. **LLM Integration:**  
   - Utilized advanced LLMs (via Gemini API and custom-trained models) for static code analysis, bug-fixing suggestions, and explaining errors.

2. **Multi-language Compiler Integration:**  
   - Integrated Judge0 API for secure, robust, and real-time multi-language code compilation with support for various file types.

3. **Efficient API Design:**  
   - Developed a custom debugging API running on a DGX server with GPU acceleration, ensuring high accuracy in bug analysis and fix generation.

4. **Interactive Frontend Architecture:**  
   - Built with Next.js (MERN stack) to provide real-time code input/output interactions, dynamic language-specific compiler settings, and visual feedback.

5. **Extension-Environment Awareness:**  
   - The VSCode extension, built in JavaScript, automatically detects the active file and delivers intelligent static analysis and suggestions without manual setup.

6. **Modular System Design:**  
   - Components like the compiler, analyser, and debugger are designed as independent microservices, facilitating easier maintenance and future upgrades.

7. **Model Evaluation and Testing:**  
   - Multiple debugging models were tested for accuracy in code structure understanding and the ability to resolve logical versus syntax/runtime errors.  
   - Metrics such as latency, accuracy, and compatibility with multi-language inputs were rigorously recorded.

8. **Security & Isolation:**  
   - Execution environments are sandboxed for safety, ensuring that compiling untrusted code via Judge0 or through the extension remains secure.

---
