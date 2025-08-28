package security

import (
	"testing"
	"time"
)

func TestJWTGenerateVerify(t *testing.T) {
	j := NewJWTManager("secret", "refresh", time.Minute, time.Hour)
	access, err := j.GenerateAccessToken(1)
	if err != nil {
		t.Fatalf("access: %v", err)
	}
	refresh, err := j.GenerateRefreshToken(1, "tokenid")
	if err != nil {
		t.Fatalf("refresh: %v", err)
	}
	uid, err := j.VerifyAccessToken(access)
	if err != nil || uid != 1 {
		t.Fatalf("verify access: %v %d", err, uid)
	}
	uid2, jti, err := j.VerifyRefreshToken(refresh)
	if err != nil || uid2 != 1 || jti != "tokenid" {
		t.Fatalf("verify refresh: %v %d %s", err, uid2, jti)
	}
}
