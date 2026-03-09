from fastapi import FastAPI
from ...models import User
from ...crud import insert_user, get_users

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Mirror Connect Backend Running"}

@app.post("/users")
def create_user(user: User):
    return insert_user(user.dict())

@app.get("/users")
def read_users():
    return get_users()