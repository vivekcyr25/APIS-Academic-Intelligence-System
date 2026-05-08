import type { AttendanceRecord, AssignmentRecord } from '../../types/academic';

const API_URL = '/api/ums-sync';

export interface UMSSyncResult {
  attendance: any[];
  assignments: any[];
  marks: any[];
  timetable: any[];
}

export const umsService = {
  async extractFromVision(imageBase64: string, onProgress?: (msg: string) => void): Promise<UMSSyncResult> {

    
    // Detect MIME type from base64 string
    const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';


    onProgress?.('Initializing AI Vision...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract_vision', imageBase64, mimeType })
      });

      const rawText = await response.text();


      if (!rawText || rawText.trim() === "") {
        throw new Error('Empty AI response from institutional gateway.');
      }

      if (rawText.trim().startsWith('<')) {
        throw new Error('Received HTML instead of JSON. Backend routing issue.');
      }

      const result = JSON.parse(rawText);
      if (!result.success) throw new Error(result.message || 'AI Extraction failed');

      onProgress?.('Academic intelligence extracted.');
      return result.data;
      
    } catch (err: any) {
      throw err;
    }
  }
};
