package domain

import "time"

// Cooldown represents a provider cooldown record
type Cooldown struct {
	ID         uint64    `json:"id"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
	ProviderID uint64    `json:"providerID"`
	ClientType string    `json:"clientType"` // Empty for global cooldown
	UntilTime  time.Time `json:"untilTime"`  // Absolute time when cooldown ends
}
