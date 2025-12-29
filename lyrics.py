import mutagen
from mutagen.id3 import ID3, SYLT, Encoding
import re
import os

def parse_lrc():
    lyrics = []
    time_pattern = re.compile(r"\[(\d+):(\d+)\.(\d+)\]")
    
    with open("lyrics.lrc", "r") as file:
        for line in file:
            match = time_pattern.match(line)
            if match:
                minutes, seconds, milliseconds = map(int, match.groups())
                time_in_ms = (minutes * 60 + seconds) * 1000 + milliseconds
                text = line[match.end():].strip()
                lyrics.append((text, time_in_ms))
    
    return lyrics

def add_lyrics_to_mp3(job_id):
    lyrics = parse_lrc()
    audio = mutagen.File("downloads/" + job_id + ".pre.mp3", easy=False)
    
    if audio.tags is None:
        audio.add_tags()
    
    audio.tags.delall("SYLT")
    
    sylt = SYLT(encoding=Encoding.UTF8, format=2, type=1, text=[])

    for text, time_in_ms in lyrics:
        sylt.text.append((text, time_in_ms))
    
    audio.tags.add(sylt)
    audio.save()

    os.remove("lyrics.lrc")

if __name__ == "__main__":
    import sys
    job_id = sys.argv[1]
    add_lyrics_to_mp3(job_id)
