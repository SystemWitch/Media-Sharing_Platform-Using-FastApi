from datetime import datetime, timedelta
from jose import jwt
from config import SECRET_KEY, ALGORITHM

# -----------------------------
# PASSWORD HANDLING (PLAIN TEXT)
# -----------------------------
def hash_password(password: str) -> str:
    # simply return the password as-is
    return password

def verify_password(plain: str, hashed: str) -> bool:
    # simple string comparison
    return plain == hashed

# -----------------------------
# JWT TOKEN FUNCTIONS
# -----------------------------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
