from fastapi import FastAPI
from .api.routes import bookings, schedules, clients, chatbot

app = FastAPI(title="Mirror Assistant Chatbot Backend")

API_PREFIX = "/api/v1"

# Register Routers
app.include_router(bookings.router, prefix=API_PREFIX)
app.include_router(schedules.router, prefix=API_PREFIX)
app.include_router(clients.router, prefix=API_PREFIX)
app.include_router(chatbot.router, prefix=API_PREFIX)

@app.get("/")
def home():
    return {"message": "Mirror Assistant Backend Running"}