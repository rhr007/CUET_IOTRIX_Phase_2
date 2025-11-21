from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    phone: str = Field(unique=True)
    password: str
    ac_type: str = Field(default=None)

    is_active: bool = Field(default=False)


class Token(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    token_value: str = Field(unique=True)  # the actual token
    given_by: int = Field(foreign_key="user.id")  # manager who gave it
    owned_by: int | None = Field(foreign_key="user.id")  # student who owns it
    created_at: datetime = Field(default_factory=datetime.utcnow)  # when token was given
    used_at: datetime | None = None  # when student used it
    is_used: bool | None = Field(default=False)  # flag for usage

