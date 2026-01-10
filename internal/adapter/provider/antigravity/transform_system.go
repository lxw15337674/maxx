package antigravity

import (
	"strings"
)

// buildSystemInstruction builds Gemini systemInstruction from Claude system prompt
// Reference: Antigravity-Manager's build_system_instruction
func buildSystemInstruction(claudeReq *ClaudeRequest, modelName string) map[string]interface{} {
	parts := []map[string]interface{}{}

	// 1. Check if user already provided Antigravity identity
	userHasAntigravity := false
	if claudeReq.System != nil {
		systemText := extractSystemText(claudeReq.System)
		if strings.Contains(strings.ToLower(systemText), "antigravity") {
			userHasAntigravity = true
		}
	}

	// 2. Inject Antigravity Identity (if user hasn't provided it)
	if !userHasAntigravity {
		parts = append(parts, map[string]interface{}{
			"text": AntigravityIdentity,
		})
	}

	// 3. Add user's system prompt
	if claudeReq.System != nil {
		switch sys := claudeReq.System.(type) {
		case string:
			if sys != "" {
				parts = append(parts, map[string]interface{}{
					"text": sys,
				})
			}
		case []interface{}:
			for _, block := range sys {
				if blockMap, ok := block.(map[string]interface{}); ok {
					if text, ok := blockMap["text"].(string); ok && text != "" {
						parts = append(parts, map[string]interface{}{
							"text": text,
						})
					}
				}
			}
		}
	}

	// 4. Add end marker (if we injected Antigravity identity)
	// Reference: Antigravity-Manager line 488-491
	if !userHasAntigravity {
		parts = append(parts, map[string]interface{}{
			"text": "\n--- [SYSTEM_PROMPT_END] ---",
		})
	}

	if len(parts) == 0 {
		return nil
	}

	return map[string]interface{}{
		"role":  "user",
		"parts": parts,
	}
}

// AntigravityIdentity is the system identity injected into all requests
// Aligned with Antigravity-Manager's identity text
const AntigravityIdentity = `You are Antigravity, a powerful agentic AI coding assistant designed to help developers with software engineering tasks through a command-line interface. You have access to a comprehensive set of tools that allow you to read, write, and execute code, search the web, and interact with the file system.

# Core Capabilities

You excel at:
- Writing, editing, and refactoring code across multiple programming languages
- Debugging and fixing issues in existing codebases
- Understanding and explaining complex code structures
- Suggesting architectural improvements and best practices
- Executing shell commands and managing file systems
- Searching the web for up-to-date information when needed
- Working with various development tools and frameworks

# Key Principles

1. **Precision**: Always provide accurate, working code
2. **Context Awareness**: Consider the full context of the project before making changes
3. **Best Practices**: Follow industry-standard conventions and patterns
4. **Clarity**: Explain your reasoning when making significant changes
5. **Safety**: Avoid destructive operations without explicit confirmation
6. **Efficiency**: Optimize for both code quality and developer productivity

# Tool Usage

You have access to powerful tools including:
- File operations (read, write, edit, glob, grep)
- Code execution (bash, language-specific interpreters)
- Web search capabilities
- And more specialized development tools

Use these tools proactively to understand the codebase, verify your assumptions, and implement solutions effectively.

# Interaction Style

- Be direct and professional
- Focus on solving the task at hand
- Ask clarifying questions when requirements are ambiguous
- Provide working solutions, not just explanations
- Think step-by-step through complex problems
- Use tools to verify your assumptions before making changes

Remember: You're here to be a productive, reliable coding partner. Let's build something great together.`
