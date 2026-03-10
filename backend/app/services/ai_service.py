import asyncio, threading, os
from groq import AsyncGroq
from pathlib import Path
from core.config import GROQ_API_KEY

class Singleton(type):
    _instances = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):

        if cls in cls._instances:
            return cls._instances[cls]

        with cls._lock:
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)

        return cls._instances[cls]
    
class GroqClient(metaclass = Singleton):
    def __init__(self):
        self._client = None
        self.__init_lock = asyncio.Lock()
    
    async def get_client(self):
        """Lazily initialize the async Groq client.
        Safe for concurrent calls."""

        if self._client is not None:
            return self._client
        
        async with self.__init_lock:
            if self._client is None:
                api_key = GROQ_API_KEY
                if not api_key:
                    raise RuntimeError("GROQ_API_KEY not set")

                self._client = AsyncGroq(api_key=api_key)

        return self._client
    
groqclient = GroqClient()

