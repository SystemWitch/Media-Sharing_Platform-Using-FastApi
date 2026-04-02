from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class MediaOut(BaseModel):
    id: int
    file_url: str   