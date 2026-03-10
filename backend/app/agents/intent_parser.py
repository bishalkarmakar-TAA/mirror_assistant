# intent_parser.py

import logging
from typing import Any, Dict
from services.ai_service import groqclient
from core.config import MODEL_NAME

INTENTS = [
    "OPEN_SLOT",
    "EDIT_SLOT",
    "DELETE_SLOT",
    "CREATE_BOOKING",
    "EDIT_BOOKING",
    "DELETE_BOOKING",
    "FETCH_DAY_SCHEDULE",
    "FETCH_CLIENT_SCHEDULE",
    "VIEW_UPCOMING_SESSIONS",
    "UNKNOWN"
]

ENTITY_FIELDS = [
    "date",
    "time",
    "start_time",
    "end_time",
    "client_name",
    "booking_id",
    "slot_id"
]


class IntentParser:
    async def parse_intent(self, message: str) -> dict:
        """
        Parse user message to intent and entities using LLM (AIService).
        Returns a predictable JSON object.
        """
        logging.info("User message: %s", message)
        prompt = self._system_prompt()
        user_prompt = self._user_prompt(message)
        client = await groqclient.get_client()
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": prompt},
                      {"role": "user", "content": user_prompt}]
        )
        llm_output = response.choices[0].message.content
        result = self._safe_json_parse(llm_output)
        intent = result.get("intent")
        if intent not in INTENTS:
            intent = "UNKNOWN"
        # Always return all entity fields, null if missing
        entities = result.get("entities", {})
        entities_out = {field: entities.get(
            field) if field in entities else None for field in ENTITY_FIELDS}
        # Remove keys with None values for brevity, but keep at least an empty dict
        entities_out = {field: entities.get(field) for field in ENTITY_FIELDS} or {}
        parsed = {"intent": intent, "entities": entities_out}
        logging.info("Parsed intent: %s", parsed)
        return parsed

    def _safe_json_parse(self, text: str) -> dict:
        """
        Safely parse JSON from LLM output. Fallback to UNKNOWN if invalid.
        """
        import json
        try:
            # Find first {...} block if extra text is present
            start = text.find('{')
            end = text.rfind('}') + 1
            if start == -1 or end == -1:
                raise ValueError("No JSON object found")
            json_str = text[start:end]
            return json.loads(json_str)
        except Exception:
            return {"intent": "UNKNOWN", "entities": {}}

    def _system_prompt(self) -> str:
        return (
            "You are an intent parser for a mental health scheduling assistant. "
            "Your job is to classify the user's intent and extract structured entities from their message. "
            "Supported intents: " + ", ".join(INTENTS) + ". "
            "Entities may include: date, time, start_time, end_time, client_name, booking_id, slot_id. "
            "ALWAYS return a single valid JSON object with keys 'intent' and 'entities'. "
            "If an entity is missing, set its value to null. "
            "NEVER include explanations, markdown, or any text outside the JSON object. "
            "NEVER return more than one JSON object. "
            "Always choose the closest matching intent from the list. "
        )

    def _user_prompt(self, message: str) -> str:
        return (
            f"Message: {message}\n"
            "Return a JSON object with keys: intent, entities (with possible keys: date, time, start_time, end_time, client_name, booking_id, slot_id). "
            "If an entity is missing, set its value to null. "
            "Example:\n"
            '{"intent": "CREATE_BOOKING", "entities": {"date": "2024-03-11", "time": "15:00", "client_name": "John"}}'
        )
