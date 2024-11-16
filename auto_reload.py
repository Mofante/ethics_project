import subprocess
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

FRONTEND_DIR = "./front"
BACKEND_DIR = "./back"

class ProcessManager:
    def __init__(self, command, name, path):
        self.command = command
        self.name = name
        self.path = path
        self.process = None

    def start(self):
        print(f"Starting {self.name}...")
        self.process = subprocess.Popen(self.command, cwd=self.path)

    def restart(self):
        print(f"Restarting {self.name}...")
        self.stop()
        self.start()

    def stop(self):
        if self.process:
            print(f"Stopping {self.name}...")
            self.process.terminate()
            self.process.wait()
            self.process = None

class ReloadHandler(FileSystemEventHandler):
    def __init__(self, manager, watched_dir):
        self.manager = manager
        self.watched_dir = watched_dir

    def on_any_event(self, event):
        if event.src_path.endswith(".py"):
            print(f"Change detected in {self.watched_dir}: {event.src_path}")
            self.manager.restart()


frontend_process = ProcessManager(["livereload", "-p", "3000"], "Frontend", FRONTEND_DIR)
backend_process = ProcessManager(["uvicorn", "app:app", "--reload"], "Backend", BACKEND_DIR)
backend_reload_handler = ReloadHandler(backend_process, BACKEND_DIR)
observer = Observer()
observer.schedule(backend_reload_handler, path=BACKEND_DIR, recursive=True)

try:
    frontend_process.start()
    backend_process.start()
    observer.start()
    while (True):
        time.sleep(1) 

except KeyboardInterrupt:
    print("Shutting down...")

finally:
    observer.stop()
    backend_process.stop()
    frontend_process.stop()
