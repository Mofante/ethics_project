from pydantic import BaseModel

class Record(BaseModel):
    session_id: str
    youtube_time: int
    tiktok_time: int
    instagram_time: int
    facebook_time: int
    snapchat_time: int
    reddit_time: int
    pinterest_time: int
    linkedin_time: int
    twitter_time: int
    twitch_time: int
    netflix_time: int 
    disneyplus_time: int
    text_count: int
    emails_count: int
    google_searches_count: int
