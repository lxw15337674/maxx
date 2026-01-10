package antigravity

import (
	"strings"
)

// buildTools converts Claude tools to Gemini tools format
// Reference: Antigravity-Manager's build_tools
func buildTools(claudeReq *ClaudeRequest) interface{} {
	if claudeReq.Tools == nil || len(claudeReq.Tools) == 0 {
		return nil
	}

	functionDeclarations := []map[string]interface{}{}
	hasWebSearch := false

	for _, tool := range claudeReq.Tools {
		// 1. Detect server-side tools (Web Search)
		if isWebSearchTool(tool) {
			hasWebSearch = true
			continue
		}

		// 2. Client-side tools: clean input_schema
		inputSchema := tool.InputSchema
		if inputSchema == nil {
			inputSchema = map[string]interface{}{
				"type":       "object",
				"properties": map[string]interface{}{},
			}
		}

		// Deep copy to avoid modifying original
		cleanedSchema := deepCopyMap(inputSchema)
		CleanJSONSchema(cleanedSchema)

		functionDeclarations = append(functionDeclarations, map[string]interface{}{
			"name":        tool.Name,
			"description": tool.Description,
			"parameters":  cleanedSchema,
		})
	}

	// 3. Build tools object
	if len(functionDeclarations) == 0 && !hasWebSearch {
		return nil
	}

	toolObj := make(map[string]interface{})

	if len(functionDeclarations) > 0 {
		toolObj["functionDeclarations"] = functionDeclarations
	}

	// Inject googleSearch if detected
	if hasWebSearch {
		toolObj["googleSearch"] = map[string]interface{}{}
	}

	return []map[string]interface{}{toolObj}
}

// isWebSearchTool checks if a tool is a Web Search tool
// These are server-side tools that should be converted to googleSearch
func isWebSearchTool(tool ClaudeTool) bool {
	nameLower := strings.ToLower(tool.Name)

	// Common Web Search tool names
	webSearchNames := []string{
		"web_search",
		"websearch",
		"google_search",
		"googlesearch",
		"googlesearchretrieval",
		"search",
		"internet_search",
	}

	for _, name := range webSearchNames {
		if nameLower == name {
			return true
		}
	}

	// Also check description for web search keywords
	descLower := strings.ToLower(tool.Description)
	if strings.Contains(descLower, "web search") ||
		strings.Contains(descLower, "google search") ||
		strings.Contains(descLower, "internet search") {
		return true
	}

	return false
}

// hasWebSearchTool checks if the request contains any Web Search tools
func hasWebSearchTool(claudeReq *ClaudeRequest) bool {
	if claudeReq.Tools == nil {
		return false
	}

	for _, tool := range claudeReq.Tools {
		if isWebSearchTool(tool) {
			return true
		}
	}

	return false
}

// deepCopyMap creates a deep copy of a map to avoid modifying original data
func deepCopyMap(src map[string]interface{}) map[string]interface{} {
	if src == nil {
		return nil
	}

	dst := make(map[string]interface{}, len(src))

	for key, value := range src {
		switch v := value.(type) {
		case map[string]interface{}:
			dst[key] = deepCopyMap(v)
		case []interface{}:
			dst[key] = deepCopySlice(v)
		default:
			dst[key] = v
		}
	}

	return dst
}

// deepCopySlice creates a deep copy of a slice
func deepCopySlice(src []interface{}) []interface{} {
	if src == nil {
		return nil
	}

	dst := make([]interface{}, len(src))

	for i, value := range src {
		switch v := value.(type) {
		case map[string]interface{}:
			dst[i] = deepCopyMap(v)
		case []interface{}:
			dst[i] = deepCopySlice(v)
		default:
			dst[i] = v
		}
	}

	return dst
}
