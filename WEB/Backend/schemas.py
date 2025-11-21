from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    phone: str
    password: str
    ac_type: str


class LoginBase(BaseModel):
    phone: str
    password: str
