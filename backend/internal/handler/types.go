package handler

import (
    "encoding/json"
    "strconv"
    "strings"
)

// IntOrString unmarshals a JSON value that can be either a number or a numeric string
type IntOrString int

func (i *IntOrString) UnmarshalJSON(b []byte) error {
    if len(b) == 0 {
        return nil
    }
    // If quoted, treat as string
    if b[0] == '"' {
        var s string
        if err := json.Unmarshal(b, &s); err != nil {
            return err
        }
        s = strings.TrimSpace(s)
        if s == "" {
            *i = 0
            return nil
        }
        v, err := strconv.Atoi(s)
        if err != nil {
            return err
        }
        *i = IntOrString(v)
        return nil
    }
    // Try integer directly
    var n int
    if err := json.Unmarshal(b, &n); err == nil {
        *i = IntOrString(n)
        return nil
    }
    // Fallback: float -> int
    var f float64
    if err := json.Unmarshal(b, &f); err != nil {
        return err
    }
    *i = IntOrString(int(f))
    return nil
}

