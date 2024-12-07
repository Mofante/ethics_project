from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from models import Record
from models import Response


def create_connection():
    connection = sqlite3.connect("records.db")
    return connection

def create_table():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS records (
        session_id TEXT NOT NULL,
        youtube_time INTEGER NOT NULL,
        tiktok_time INTEGER NOT NULL,
        instagram_time INTEGER NOT NULL,
        facebook_time INTEGER NOT NULL,
        snapchat_time INTEGER NOT NULL,
        reddit_time INTEGER NOT NULL,
        pinterest_time INTEGER NOT NULL,
        linkedin_time INTEGER NOT NULL,
        twitter_time INTEGER NOT NULL,
        twitch_time INTEGER NOT NULL,
        netflix_time INTEGER NOT NULL,
        disneyplus_time INTEGER NOT NULL,
        text_count INTEGER NOT NULL,
        emails_count INTEGER NOT NULL,
        google_searches_count INTEGER NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS responses (
        expected_results TEXT NOT NULL,
        change_behavior TEXT NOT NULL,
        surprising_activity TEXT NOT NULL,
        motivation TEXT NOT NULL,
        total_emissions REAL NOT NULL
    )
    """)
    connection.commit()
    connection.close()

def create_record(record: Record):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO records (
            session_id, youtube_time, tiktok_time, instagram_time, facebook_time, 
            snapchat_time, reddit_time, pinterest_time, linkedin_time, twitter_time, 
            twitch_time, netflix_time, disneyplus_time, text_count, emails_count, google_searches_count
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        record.session_id, record.youtube_time, record.tiktok_time, record.instagram_time, record.facebook_time,
        record.snapchat_time, record.reddit_time, record.pinterest_time, record.linkedin_time, record.twitter_time,
        record.twitch_time, record.netflix_time, record.disneyplus_time, record.text_count, record.emails_count, record.google_searches_count
    ))
    connection.commit()
    connection.close()

def create_response(response: Response):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO responses (
            expected_results, change_behavior, surprising_activity, motivation, total_emissions
        ) 
        VALUES (?, ?, ?, ?, ?)
    """,
    (
        response.expected_results, response.change_behavior, response.surprising_activity, response.motivation, response.total_emissions
    ))
    connection.commit()
    connection.close()

create_table()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:35729"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_root():
    return {"message": "Hello World!"}

@app.post("/records/", response_model=Record)
def post_record(record: Record):
    create_record(record)
    return record

@app.post("/survey/", response_model=Response)
def post_survey(response: Response):
    create_response(response)
    return response