import csv
import io
from typing import List, Dict

class CSVGenerator:
    @staticmethod
    def generate_versions_csv(versions: List[Dict]) -> io.BytesIO:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["title", "content"])
        writer.writeheader()
        for v in versions:
            writer.writerow(v)
            
        mem_file = io.BytesIO()
        mem_file.write(output.getvalue().encode('utf-8'))
        mem_file.seek(0)
        return mem_file
