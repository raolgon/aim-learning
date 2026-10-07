# AImlearning
<!-- impeccable:product-schema 1 -->

## Platform
web

VS Code desktop extension with an embedded webview, local projects and native terminals. Windows, Linux, macOS, and remote VS Code workspaces.

## Users
Spanish- and English-speaking beginners learning programming through C# first, then C++, with a path toward independent projects.

## Product Purpose
Learn to reason, implement, test and explain real programs. The learner writes the code; the professor guides without supplying answers.

## Operating Context
The user explicitly chose VS Code, a gamified experience, and use of VS Code's terminal or the user's system terminal. Working name: AImlearning. Initial language confirmed: C#.

## Capabilities and Constraints
Never reveal exercise solutions, even on request. Accept different correct implementations. Teach concepts and terminal usage. Exercise hints require an attempt; conceptual help is available beforehand without completing the exercise. No solution button, automated student-code edits, speed competition, lost lives or penalties for hints. Curriculum expands through real projects.

## Implementation Decisions
Plain JavaScript extension and native VS Code themed HTML/CSS; no frontend runtime dependency. Initial release is a usable foundation course, not a claim to cover expert material. The current curriculum includes foundations, C#, C++, Python and JavaScript, six real C#/C++ projects and a separate Git path. Optional Ollama, compatible local servers, VS Code models and OpenAI generate guidance; accepted model prose appears in the teacher chat. Prepared guidance is used only without AI connected. With AI connected, failures show an error without a prepared substitute. Prompts and response checks limit solution disclosure but cannot guarantee detecting every solution in natural language. Concept requests omit exercise contracts, tests and source automatically; exercise requests include the relevant attempt and limited source context. Progress stays local; AI requests send the described context to the selected provider. API keys use VS Code SecretStorage. Tutor requests can be cancelled, retaining the draft and discarding late responses. A matching conceptual choice checks that case only; reflections and transfer answers are self-assessment, not automatically graded reasoning. No account or model is required for prepared guidance. UI versions come from the extension manifest.

## Product Principles
- The learner owns the reasoning and the code.
- Behavioral checks accept alternate implementations.
- Rewards follow completed evidence, not repeated clicks.
- Terminal skills are part of the curriculum.
- Show precisely what has and has not been verified.
