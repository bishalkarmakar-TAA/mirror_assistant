
# workflow_manager.py
from typing import Any
from agents.intent_parser import IntentParser
from agents.response_builder import ResponseBuilder
from services.schedule_service import ScheduleService
from services.booking_service import BookingService
from services.client_service import ClientService
import logging


class WorkflowManager:
    def __init__(self, db=None, professional_id=None):
        self.intent_parser = IntentParser()
        self.response_builder = ResponseBuilder
        self.schedule_service = ScheduleService()
        self.booking_service = BookingService()
        self.client_service = ClientService()
        self.db = db  # DB client, injected by backend
        # Professional's UUID, injected by backend
        self.professional_id = professional_id
        self.intent_handlers = {
            "OPEN_SLOT": self._open_slot,
            "EDIT_SLOT": self._edit_slot,
            "DELETE_SLOT": self._delete_slot,
            "CREATE_BOOKING": self._create_booking,
            "EDIT_BOOKING": self._edit_booking,
            "DELETE_BOOKING": self._delete_booking,
            "FETCH_DAY_SCHEDULE": self._fetch_day_schedule,
            "FETCH_CLIENT_SCHEDULE": self._fetch_client_schedule,
            "VIEW_UPCOMING_SESSIONS": self._view_upcoming_sessions,
        }

    async def handle_chat(self, message: str) -> str:
        try:
            # 1. Parse intent
            intent_data = await self.intent_parser.parse_intent(message)
            intent = intent_data.get("intent", "UNKNOWN")
            entities = intent_data.get("entities", {})
            logging.info("Intent detected: %s", intent)

            # 2. Route to handler
            handler = self.intent_handlers.get(intent)
            if not handler:
                return await self.response_builder.unknown_intent()

            # 3. Validate entities for each intent
            validation_error = self._validate_entities(intent, entities)
            if validation_error:
                return await self.response_builder.error(validation_error)

            # 4. Call handler
            result = await handler(entities)

            # 5. Build response
            return await self.response_builder.build(intent, result, entities)
        except Exception as e:
            logging.exception("WorkflowManager error")
            return await self.response_builder.error("Sorry, something went wrong. Please try again.")

    def _validate_entities(self, intent: str, entities: dict) -> str | None:
        # Returns error string if validation fails, else None
        if intent == "OPEN_SLOT":
            if not all(entities.get(k) for k in ("date", "start_time", "end_time")):
                return "Please specify date, start time, and end time to open a slot."
        elif intent == "CREATE_BOOKING":
            if not all(entities.get(k) for k in ("client_name", "date", "time")):
                return "Please specify client name, date, and time to create a booking."
        elif intent == "FETCH_DAY_SCHEDULE":
            if not entities.get("date"):
                return "Please specify a date to fetch the schedule."
        elif intent == "FETCH_CLIENT_SCHEDULE":
            if not entities.get("client_name"):
                return "Please specify a client name to fetch their schedule."
        return None

    # --- Service orchestration methods ---
    async def _open_slot(self, entities: dict) -> Any:
        return await self.schedule_service.create_slot(self.db, entities)

    async def _edit_slot(self, entities: dict) -> Any:
        return await self.schedule_service.edit_slot(self.db, entities)

    async def _delete_slot(self, entities: dict) -> Any:
        return await self.schedule_service.delete_slot(self.db, entities)

    async def _create_booking(self, entities: dict) -> Any:
        # Conflict detection before creating booking
        date = entities.get("date")
        time = entities.get("time")
        # Fetch the day's schedule
        schedule = await self.schedule_service.get_day_schedule(self.db, self.professional_id, date)
        # Check for time conflict
        if schedule and "entries" in schedule:
            for entry in schedule["entries"]:
                if entry.get("start_time") == time:
                    return {"conflict": True, "date": date, "time": time}
        return await self.booking_service.create_booking(self.db, entities)

    async def _edit_booking(self, entities: dict) -> Any:
        return await self.booking_service.edit_booking(self.db, entities)

    async def _delete_booking(self, entities: dict) -> Any:
        return await self.booking_service.delete_booking(self.db, entities)

    async def _fetch_day_schedule(self, entities: dict) -> Any:
        date = entities.get("date")
        return await self.schedule_service.get_day_schedule(self.db, self.professional_id, date)

    async def _fetch_client_schedule(self, entities: dict) -> Any:
        client_name = entities.get("client_name")
        client = await self.client_service.get_client_by_name(self.db, client_name)
        if not client:
             return {"client_not_found": client_name}
        return await self.client_service.get_client_bookings(self.db, client["client_id"])

    async def _view_upcoming_sessions(self, entities: dict) -> Any:
        return await self.booking_service.get_upcoming_sessions(self.db, self.professional_id)
