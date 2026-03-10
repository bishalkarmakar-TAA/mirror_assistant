from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from ...schemas.booking import Booking, BookingCreate, BookingUpdate
from ...services.booking_service import BookingService
from ..dependencies import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=dict)
def create_booking(booking: BookingCreate, db: Client = Depends(get_supabase_client)):
    try:
        return BookingService.create_booking(db, booking)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/{booking_id}", response_model=dict)
def update_booking(booking_id: UUID, booking: BookingUpdate, db: Client = Depends(get_supabase_client)):
    try:
        return BookingService.update_booking(db, booking_id, booking)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.delete("/{booking_id}", response_model=dict)
def cancel_booking(booking_id: UUID, db: Client = Depends(get_supabase_client)):
    try:
        return BookingService.cancel_booking(db, booking_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/upcoming/{professional_id}", response_model=dict)
def get_upcoming_bookings(professional_id: UUID, db: Client = Depends(get_supabase_client)):
    try:
        return BookingService.get_upcoming_bookings(db, professional_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
