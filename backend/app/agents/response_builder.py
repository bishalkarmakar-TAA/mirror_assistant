# response_builder.py
from typing import List, Dict, Optional


class ResponseBuilder:
    """
    Converts structured service outputs into fast, natural language responses for the chatbot.
    No LLM calls. Only deterministic templates and formatting.
    """

    async def slot_opened(self, date: str, start_time: str, end_time: str) -> str:
        return f"Slot opened on {date} from {start_time} to {end_time}."

    async def slot_updated(self, slot_id: str) -> str:
        return f"Slot {slot_id} has been updated."

    async def slot_deleted(self, slot_id: str) -> str:
        return f"Slot {slot_id} has been deleted."

    async def booking_created(self, client_name: str, date: str, time: str) -> str:
        return f"Booking created for {client_name} on {date} at {time}."

    async def booking_updated(self, booking_id: str) -> str:
        return f"Booking {booking_id} has been updated."

    async def booking_deleted(self, booking_id: str) -> str:
        return f"Booking {booking_id} has been deleted."

    async def day_schedule(self, date: str, bookings: List[Dict[str, str]]) -> str:
        if not bookings:
            return f"No bookings found for {date}."
        lines = [f"Here is the schedule for {date}:"]
        for b in bookings:
            client = b.get("client_name", "Unknown")
            time = b.get("time", "?")
            lines.append(f"* {time}: {client}")
        return "\n".join(lines)

    async def client_schedule(self, client_name: str, bookings: List[Dict[str, str]]) -> str:
        if not bookings:
            return f"No bookings found for {client_name}."
        lines = [f"Schedule for {client_name}:"]
        for b in bookings:
            date = b.get("date", "?")
            time = b.get("time", "?")
            lines.append(f"* {date} at {time}")
        return "\n".join(lines)

    async def upcoming_sessions(self, bookings: List[Dict[str, str]]) -> str:
        if not bookings:
            return "No upcoming sessions found."
        lines = ["Upcoming sessions:"]
        for b in bookings:
            date = b.get("date", "?")
            time = b.get("time", "?")
            client = b.get("client_name", "Unknown")
            lines.append(f"* {date} at {time}: {client}")
        return "\n".join(lines)

    async def conflict_detected(self, date: str, time: str) -> str:
        return f"Schedule conflict detected on {date} at {time}."

    async def slot_unavailable(self, date: str, time: str) -> str:
        return f"Slot unavailable on {date} at {time}."

    async def unknown_intent(self, message: Optional[str] = None) -> str:
        return "Sorry, I didn't understand that. Could you rephrase?"

    async def error(self, detail: Optional[str] = None) -> str:
        return f"An error occurred. {detail or ''}"

    async def build(self, intent: str, result: any, entities: dict) -> str:
        """
        Main entry point for WorkflowManager to build a response.
        """
        if isinstance(result, dict) and result.get("conflict"):
            return await self.conflict_detected(result["date"], result["time"])
        if isinstance(result, dict) and result.get("client_not_found"):
            return f"No client found with name '{result['client_not_found']}'."
        # Map intent to method
        if intent == "OPEN_SLOT":
            return await self.slot_opened(entities.get("date", "?"), entities.get("start_time", "?"), entities.get("end_time", "?"))
        elif intent == "EDIT_SLOT":
            return await self.slot_updated(entities.get("slot_id", "?"))
        elif intent == "DELETE_SLOT":
            return await self.slot_deleted(entities.get("slot_id", "?"))
        elif intent == "CREATE_BOOKING":
            return await self.booking_created(entities.get("client_name", "?"), entities.get("date", "?"), entities.get("time", "?"))
        elif intent == "EDIT_BOOKING":
            return await self.booking_updated(entities.get("booking_id", "?"))
        elif intent == "DELETE_BOOKING":
            return await self.booking_deleted(entities.get("booking_id", "?"))
        elif intent == "FETCH_DAY_SCHEDULE":
            return await self.day_schedule(entities.get("date", "?"), result or [])
        elif intent == "FETCH_CLIENT_SCHEDULE":
            return await self.client_schedule(entities.get("client_name", "?"), result or [])
        elif intent == "VIEW_UPCOMING_SESSIONS":
            return await self.upcoming_sessions(result or [])
        else:
            return await self.unknown_intent()


# Reusable instance
response_builder = ResponseBuilder()
