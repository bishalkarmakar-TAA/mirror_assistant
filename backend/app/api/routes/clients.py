from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from ...services.client_service import ClientService
from ..dependencies import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("/{client_id}/bookings", response_model=dict)
def get_client_bookings(client_id: UUID, db: Client = Depends(get_supabase_client)):
    try:
        return ClientService.get_client_bookings(db, client_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/search", response_model=dict)
def search_client(name: str, db: Client = Depends(get_supabase_client)):
    try:
        return ClientService.get_client_by_name(db, name)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
