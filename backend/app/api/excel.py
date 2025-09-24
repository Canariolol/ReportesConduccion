from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
from ..models.excel import ProcessedReport
from ..services.excel_service import ExcelService
from ..core.config import settings

router = APIRouter()

# Modelos para los nuevos endpoints
class BatchDeleteRequest(BaseModel):
    report_ids: List[str]
    user_id: str

class BatchDeleteResponse(BaseModel):
    deleted_count: int
    total_requested: int
    errors: List[str]
    success: bool

class FilenameDeleteResponse(BaseModel):
    deleted_count: int
    filename: str
    errors: List[str]
    success: bool

# Initialize service
excel_service = ExcelService()

@router.post("/upload", response_model=ProcessedReport)
async def upload_excel_file(
    file: UploadFile = File(...),
    user_id: str = Form(default="demo_user")
):
    """
    Upload and process Excel file
    """
    try:
        # Validate file type
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400, 
                detail="Only Excel files (.xlsx, .xls) are allowed"
            )
        
        # Validate file size
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Process Excel file
        report = await excel_service.process_excel_file(
            file_content=file_content,
            filename=file.filename,
            user_id=user_id
        )
        
        return report
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/reports/{report_id}", response_model=ProcessedReport)
async def get_report(report_id: str):
    """
    Get a specific report by ID
    """
    try:
        report = await excel_service.get_report(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/reports", response_model=List[ProcessedReport])
async def get_user_reports(
    user_id: str = "demo_user",
    limit: int = 50
):
    """
    Get all reports for a user
    """
    try:
        reports = await excel_service.get_user_reports(user_id, limit)
        return reports
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """
    Delete a specific report
    """
    try:
        success = await excel_service.delete_report(report_id)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/summary")
async def get_reports_summary(user_id: str = "demo_user"):
    """
    Get summary statistics for user reports
    """
    try:
        summary = await excel_service.get_reports_summary(user_id)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "excel-api"}

# Nuevos endpoints para la funcionalidad solicitada

@router.post("/upload/upsert", response_model=ProcessedReport)
async def upload_excel_upsert(
    file: UploadFile = File(...),
    user_id: str = Form(default="demo_user")
):
    """
    Upload Excel file with upsert functionality (create or update based on filename)
    """
    try:
        # Validate file type
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400, 
                detail="Only Excel files (.xlsx, .xls) are allowed"
            )
        
        # Validate file size
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Process Excel file with upsert
        report = await excel_service.upsert_report_by_filename(
            file_content=file_content,
            filename=file.filename,
            user_id=user_id
        )
        
        return report
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/reports/batch-delete", response_model=BatchDeleteResponse)
async def batch_delete_reports(request: BatchDeleteRequest):
    """
    Delete multiple reports at once
    """
    try:
        result = await excel_service.delete_reports_batch(
            report_ids=request.report_ids,
            user_id=request.user_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/reports/by-filename/{filename}", response_model=FilenameDeleteResponse)
async def delete_reports_by_filename(
    filename: str,
    user_id: str = "demo_user"
):
    """
    Delete all reports for a user that match a specific filename
    """
    try:
        result = await excel_service.delete_user_reports_by_filename(
            filename=filename,
            user_id=user_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/reports/by-filename/{filename}", response_model=Optional[ProcessedReport])
async def get_report_by_filename(
    filename: str,
    user_id: str = "demo_user"
):
    """
    Get report by filename (without extension) for a specific user
    """
    try:
        report = await excel_service.get_report_by_filename(filename, user_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
