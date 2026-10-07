# AImlearning

A VS Code academy for programming foundations, C#, C++, Python and JavaScript, with six real projects for C# and C++ and a separate Git practice path.

Use **Language** in the academy header or sidebar to choose **English** or **Español**. You can also set `aimlearning.language` in VS Code settings. Your choice persists across sessions.

Start with **Before coding**, then select a language path. **Understand the idea** first takes you to the concept and a different worked example. After reviewing it, continue to your own attempt. Marking a lesson as reviewed remembers your place across folders; it does not award XP, verify knowledge or complete the mission. Hints remain locked until you try. The teacher guides your reasoning and accepts correct alternative approaches without providing solutions.

Use the VS Code terminal or your system terminal to run the suggested commands yourself. Complete each mission by checking the current program and explaining what you learned. Real projects cover desktop interfaces, databases, tests and, after the prerequisites, collaboration with GitHub.

Lessons, interface guidance and new teacher responses use your selected language. Your code, notes, progress and previous AI messages remain intact. **Filenames, commands and required output literals stay unchanged**: use the exact strings specified by the exercise, including Spanish output when required.

For optional AI guidance, connect a model already available in VS Code, your OpenAI API key, Ollama, or a compatible local server. The chosen language is passed to every provider. The teacher retains the same rules against providing solutions in both languages.

Native command titles and VS Code settings descriptions follow VS Code's display language. The academy language selector controls the learning content independently.

## Generative teacher

Without an AI connection, lessons, projects and Git use prepared local guidance. With AI connected, guidance and hints come from that model. Exercise guidance and hints require an attempt first. Requests include the relevant attempt, stage, recent dialogue, check results and up to 12,000 characters of lesson or project source. Git hints use the recorded attempt and step context.

Network errors, empty replies and responses rejected by the teacher checks show an error; they do not create a prepared replacement response. Disconnect AI to return to general guidance. Previous dialogue stays intact.

Laya cannot generate replies and is no longer offered as a teacher provider. For legacy Laya selections, connect a generative model.

Ollama requests disable internal thinking so the response budget is available for guidance. Choose **Connect AI → Ollama local → gemma4:e2b**. The teacher supports generative feedback in lessons, real projects and Git hints.

## Teacher chat

Lessons and project stages have a scrollable conversation with a composer below it. Enter sends; Shift+Enter adds a line. Your message appears while the teacher thinks. Successful replies clear the composer; failures preserve your draft and show an inline error. Reading older messages keeps your scroll position. **Go to the latest message** returns to the end. Up to 200 messages are retained per lesson or project; the model still receives only the six most recent turns. An attempt is required for exercise guidance and hints. Concept questions can be asked before an attempt.

## Guided preparation

Before the first coding mission, **Prepare my environment** guides you through one task at a time: choose a folder, review workspace trust, check the programming tool, open a terminal and create the first file. Each task explains what to do and what to expect. Checks use the system running this VS Code window: Windows, macOS, Linux or WSL. For C++, the check also verifies C++17 support without building an application. You can cancel the check. Missing tools show installation guidance and a link to the executable setting.

The guided terminal opens PowerShell on Windows, zsh on macOS or bash on Linux/WSL. It sends no commands. You then create the starting files, which contain no solution, and follow the explained commands yourself. Existing mission files keep their command guide and offer a way to review preparation. Changing the syntax selector later changes the guide only; use a matching terminal profile.

## Concept help and a visible conversation

**I need to understand the concept** opens the teacher with an editable question. In unlocked lessons, concept help is available before an attempt and without a workspace or code. With AI connected, the model generates the explanation; without AI, help uses the lesson and its separate example. Concept requests include the question, lesson, example and recent concept messages. They do not automatically include the exercise contract, tests, files or implementation discussion. The rules against providing solutions remain active. AI failures show an error without a prepared replacement.

Exercise hints and checks still require a recorded attempt. The form states its minimum (40 characters for foundations, 15 for coding missions), suggests questions to help you start and displays a count. Validation errors appear beside the field and preserve your draft. Recording an attempt does not certify correctness.

The teacher view uses a compact mission header with expandable goal information. The chat header shows the model or general guidance and **Connect AI**. Saved attempts have a short preview and can be reviewed or edited; saving returns focus to the composer. In narrow panels, **View my path** opens or closes navigation to leave space for the conversation.

## Cancellable waiting and foundation reflection

AI requests show elapsed waiting time and **Cancel request**, including project guidance and Git hints. Cancellation preserves your message and lets you resend it. AImlearning forwards cancellation to the provider and discards late replies; a server may continue calculating if it ignores the disconnected request. It does not add prepared replacement guidance. The local-model loading message describes a possibility, not a confirmed diagnosis.

A matching foundation choice confirms only that the option fits that scenario. It does not certify your reasoning. A question about another situation then helps you apply the concept in your reflection. That explanation is saved as self-assessment, without automatic grading or additional progress gates. All academy surfaces read their version from the extension manifest.
