import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ResponseBuilder:
    """
    Constructs the final structured response dict that ChatbotService expects.
    Adds a metadata layer so the frontend can easily filter and highlight UI elements.
    """
    
    @staticmethod
    def build(reply: str, intent: str, executed_tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        
        action_suggested = len(executed_tools) > 0 or intent not in ["general_inquiry", "unknown_action"]
        
        # Extract structured metadata from the tools called
        metadata = {
            "last_action": None,
            "parameters": {}
        }
        
        # If tools were used, grab the very last action taken to populate the metadata
        if executed_tools:
            last_tool = executed_tools[-1]
            metadata["last_action"] = last_tool.get("name")
            try:
                # Safely parse the JSON arguments the LLM generated
                metadata["parameters"] = json.loads(last_tool.get("arguments", "{}"))
            except Exception as e:
                logger.warning(f"Failed to parse tool arguments for metadata: {e}")

        response = {
            "reply": reply,
            "intent": intent,
            "action_suggested": action_suggested,
            "metadata": metadata
        }
        
        logger.debug(f"Built final response payload: {response}")
        return response

response_builder = ResponseBuilder()