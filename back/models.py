from pydantic import BaseModel

class Record(BaseModel):
    session_id: str
    tiktok_time: int
    netflix_time: int 
