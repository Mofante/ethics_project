from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from models import Record


def create_connection():
    connection = sqlite3.connect("records.db")
    return connection

def create_table():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS records (
        session_id TEXT NOT NULL,
        tiktok_time INTEGER NOT NULL,
        netflix_time INTEGER NOT NULL
    )
    """)
    connection.commit()
    connection.close()

def create_record(record: Record):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO records (session_id, tiktok_time, netflix_time) VALUES (?, ?, ?)",
                   (record.session_id, record.tiktok_time, record.netflix_time))
    connection.commit()
    connection.close()


create_table()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
