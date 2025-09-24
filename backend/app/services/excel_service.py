from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import os
from ..models.excel import ProcessedReport
from ..utils.excel_parser import ExcelParser
from ..core.firebase import firebase_manager

class ExcelService:
    def __init__(self):
        self.parser = ExcelParser()
        self.db = firebase_manager.get_db()
        self.storage = firebase_manager.get_storage()
    
    async def process_excel_file(self, file_content: bytes, filename: str, user_id: str = "demo_user") -> ProcessedReport:
        """Process Excel file and save to Firestore"""
        try:
            # Parse Excel file
            excel_data = self.parser.parse_excel_file(file_content, filename)
            
            # Generate report
            report = self.parser.generate_report(excel_data, user_id)
            
            # Save to Firestore
            report_id = await self._save_report_to_firestore(report)
            
            # Update report with ID
            report.id = report_id
            
            return report
        except Exception as e:
            raise ValueError(f"Error processing Excel file: {str(e)}")
    
    async def _save_report_to_firestore(self, report: ProcessedReport) -> str:
        """Save report to Firestore"""
        try:
            # Convert datetime to timestamp for Firestore
            report_dict = report.dict()
            report_dict['created_at'] = datetime.utcnow()
            report_dict['updated_at'] = datetime.utcnow()
            
            # Generate document ID
            doc_id = str(uuid.uuid4())
            
            # Save to Firestore
            doc_ref = self.db.collection('reports').document(doc_id)
            doc_ref.set(report_dict)
            
            return doc_id
        except Exception as e:
            raise ValueError(f"Error saving report to Firestore: {str(e)}")
    
    async def get_report(self, report_id: str) -> Optional[ProcessedReport]:
        """Get report by ID from Firestore"""
        try:
            doc_ref = self.db.collection('reports').document(report_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return ProcessedReport(**data)
            return None
        except Exception as e:
            raise ValueError(f"Error getting report: {str(e)}")
    
    async def get_user_reports(self, user_id: str, limit: int = 50) -> List[ProcessedReport]:
        """Get all reports for a user"""
        try:
            query = (self.db.collection('reports')
                    .where('user_id', '==', user_id)
                    .order_by('created_at', direction='DESCENDING')
                    .limit(limit))
            
            docs = query.stream()
            reports = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                reports.append(ProcessedReport(**data))
            
            return reports
        except Exception as e:
            raise ValueError(f"Error getting user reports: {str(e)}")
    
    async def delete_report(self, report_id: str) -> bool:
        """Delete report by ID"""
        try:
            doc_ref = self.db.collection('reports').document(report_id)
            doc_ref.delete()
            return True
        except Exception as e:
            raise ValueError(f"Error deleting report: {str(e)}")
    
    async def get_reports_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary statistics for user reports"""
        try:
            query = (self.db.collection('reports')
                    .where('user_id', '==', user_id))
            
            docs = query.stream()
            
            total_reports = 0
            total_alarms = 0
            total_vehicles = set()
            
            for doc in docs:
                total_reports += 1
                data = doc.to_dict()
                total_alarms += data.get('summary', {}).get('totalAlarms', 0)
                vehicle_plate = data.get('vehicle_plate', '')
                if vehicle_plate:
                    total_vehicles.add(vehicle_plate)
            
            return {
                'totalReports': total_reports,
                'totalAlarms': total_alarms,
                'totalVehicles': len(total_vehicles),
                'lastUpdated': datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise ValueError(f"Error getting reports summary: {str(e)}")
    
    async def delete_reports_batch(self, report_ids: List[str], user_id: str) -> Dict[str, Any]:
        """Delete multiple reports at once"""
        try:
            deleted_count = 0
            errors = []
            
            # Verificar que los reportes pertenezcan al usuario antes de eliminar
            for report_id in report_ids:
                try:
                    doc_ref = self.db.collection('reports').document(report_id)
                    doc = doc_ref.get()
                    
                    if doc.exists:
                        data = doc.to_dict()
                        if data.get('user_id') == user_id:
                            doc_ref.delete()
                            deleted_count += 1
                        else:
                            errors.append(f"Report {report_id} does not belong to user {user_id}")
                    else:
                        errors.append(f"Report {report_id} not found")
                except Exception as e:
                    errors.append(f"Error deleting report {report_id}: {str(e)}")
            
            return {
                'deleted_count': deleted_count,
                'total_requested': len(report_ids),
                'errors': errors,
                'success': len(errors) == 0
            }
        except Exception as e:
            raise ValueError(f"Error in batch delete operation: {str(e)}")
    
    async def get_report_by_filename(self, filename: str, user_id: str) -> Optional[ProcessedReport]:
        """Get report by filename (without extension) for a specific user"""
        try:
            # Remove extension from filename
            filename_without_ext = os.path.splitext(filename)[0]
            
            query = (self.db.collection('reports')
                    .where('user_id', '==', user_id)
                    .where('file_name', '==', filename_without_ext))
            
            docs = query.stream()
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                return ProcessedReport(**data)
            
            return None
        except Exception as e:
            raise ValueError(f"Error getting report by filename: {str(e)}")
    
    async def upsert_report_by_filename(self, file_content: bytes, filename: str, user_id: str = "demo_user") -> ProcessedReport:
        """Create or update report based on filename (without extension)"""
        try:
            # Parse Excel file
            excel_data = self.parser.parse_excel_file(file_content, filename)
            
            # Generate report
            report = self.parser.generate_report(excel_data, user_id)
            
            # Remove extension from filename for unique identification
            filename_without_ext = os.path.splitext(filename)[0]
            report.file_name = filename_without_ext
            
            # Check if report already exists
            existing_report = await self.get_report_by_filename(filename, user_id)
            
            if existing_report:
                # Update existing report
                report_id = await self._update_report_in_firestore(existing_report.id, report)
                report.id = report_id
                operation = "updated"
            else:
                # Create new report
                report_id = await self._save_report_to_firestore(report)
                report.id = report_id
                operation = "created"
            
            # Add operation info for response
            report.operation = operation
            return report
            
        except Exception as e:
            raise ValueError(f"Error upserting report: {str(e)}")
    
    async def _update_report_in_firestore(self, report_id: str, report: ProcessedReport) -> str:
        """Update existing report in Firestore"""
        try:
            # Convert datetime to timestamp for Firestore
            report_dict = report.dict()
            report_dict['updated_at'] = datetime.utcnow()
            
            # Don't change created_at
            report_dict.pop('created_at', None)
            
            # Save to Firestore
            doc_ref = self.db.collection('reports').document(report_id)
            doc_ref.update(report_dict)
            
            return report_id
        except Exception as e:
            raise ValueError(f"Error updating report in Firestore: {str(e)}")
    
    async def delete_user_reports_by_filename(self, filename: str, user_id: str) -> Dict[str, Any]:
        """Delete all reports for a user that match a specific filename"""
        try:
            filename_without_ext = os.path.splitext(filename)[0]
            
            query = (self.db.collection('reports')
                    .where('user_id', '==', user_id)
                    .where('file_name', '==', filename_without_ext))
            
            docs = query.stream()
            deleted_count = 0
            errors = []
            
            for doc in docs:
                try:
                    doc_ref = self.db.collection('reports').document(doc.id)
                    doc_ref.delete()
                    deleted_count += 1
                except Exception as e:
                    errors.append(f"Error deleting report {doc.id}: {str(e)}")
            
            return {
                'deleted_count': deleted_count,
                'filename': filename_without_ext,
                'errors': errors,
                'success': len(errors) == 0
            }
        except Exception as e:
            raise ValueError(f"Error deleting reports by filename: {str(e)}")
