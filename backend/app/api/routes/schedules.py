from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from ...schemas.schedule import AvailabilitySlot, AvailabilitySlotCreate, AvailabilitySlotUpdate
from ...services.schedule_service import ScheduleService
from ..dependencies import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.post("/slots", response_model=dict)
def create_slot(slot: AvailabilitySlotCreate, db: Client = Depends(get_supabase_client)):
    try:
        return ScheduleService.create_slot(db, slot)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/slots/{slot_id}", response_model=dict)
def update_slot(slot_id: UUID, slot: AvailabilitySlotUpdate, db: Client = Depends(get_supabase_client)):
    try:
        return ScheduleService.update_slot(db, slot_id, slot)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.delete("/slots/{slot_id}", response_model=dict)
def delete_slot(slot_id: UUID, db: Client = Depends(get_supabase_client)):
    try:
        return ScheduleService.delete_slot(db, slot_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/day", response_model=dict)
def get_day_schedule(professional_id: UUID, date: str, db: Client = Depends(get_supabase_client)):
    try:
        return ScheduleService.get_day_schedule(db, professional_id, date)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
