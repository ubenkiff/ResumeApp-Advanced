from fastapi import APIRouter, Response
from app.models.schemas import ExportCSVRequest
from app.services.csv_generator import CSVGenerator

router = APIRouter()
generator = CSVGenerator()

@router.post("/csv")
async def export_csv(request: ExportCSVRequest):
    """Export multiple resume versions to a single CSV file."""
    versions_data = [v.dict() for v in request.resume_versions]
    csv_file = generator.generate_versions_csv(versions_data)
    
    return Response(
        content=csv_file.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=resume_versions_uae.csv"
        }
    )
