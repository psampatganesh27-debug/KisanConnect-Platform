from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from main import Listing, find_top_matches

app = FastAPI()

class ListingPayload(BaseModel):
    id: Optional[str] = None
    type: str = "Need"
    title: str
    description: str = ""
    category: str = "General"
    village: str = "Local"

@app.post("/match")
def match_endpoint(listing: ListingPayload):
    try:
        incoming = Listing(
            id=listing.id,
            type=listing.type,
            title=listing.title,
            description=listing.description,
            category=listing.category,
            village=listing.village
        )
        matches = find_top_matches(incoming, top_k=3)
        return {"status": "success", "count": len(matches), "matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))