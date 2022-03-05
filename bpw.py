import time
import shutil
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class MyEventHandler(FileSystemEventHandler):
    last_event = ''

    def on_modified(self, event):
        time.sleep(1)
        if not event.src_path == self.last_event:
            self.last_event = event.src_path
            filename = event.src_path.replace('.\\', '')
            if ".min." in filename and not "bootstrap." in filename:
                print(filename)
                nuevo = filename
                if "index.min.css" == filename:
                    shutil.move(filename, 'css/' + filename)
                if "index.min.js" == filename:
                    shutil.move(filename, 'js/' + filename)


observer = Observer()
observer.schedule(MyEventHandler(), ".", recursive=True)
observer.start()
try:
    while observer.is_alive():
        observer.join(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
