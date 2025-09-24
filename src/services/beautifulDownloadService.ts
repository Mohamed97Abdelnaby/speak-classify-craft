import { BatchFile } from "@/types/batch";

interface TranscriptionData {
  transcription?: string;
  classification?: {
    category?: string;
    aiClassification?: string;
    predicted?: string;
    confidence?: number;
    alternativeCategories?: Array<{
      name: string;
      confidence: number;
    }>;
    verified?: string;
  };
  metadata?: {
    duration?: string;
    processingTime?: string;
    tokenCount?: number;
    maxTokens?: number;
  };
  summary?: string;
  name?: string;
}

export const generateBeautifulHTML = (data: TranscriptionData | BatchFile[], isBatch: boolean = false): string => {
  const currentDate = new Date().toLocaleString('ar-EG');
  
  if (isBatch && Array.isArray(data)) {
    return generateBatchHTML(data as BatchFile[], currentDate);
  } else {
    return generateSingleHTML(data as TranscriptionData, currentDate);
  }
};

const generateSingleHTML = (data: TranscriptionData, currentDate: string): string => {
  const category = data.classification?.category || data.classification?.aiClassification || data.classification?.predicted || 'غير محدد';
  const confidence = data.classification?.confidence ? Math.round(data.classification.confidence * 100) : 0;
  
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نتائج التحليل الصوتي - Voice AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Tajawal', sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 2rem;
      color: white;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: shine 3s infinite;
    }
    
    @keyframes shine {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 1;
    }
    
    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    
    .content {
      padding: 2rem;
    }
    
    .section {
      margin-bottom: 2rem;
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      border-right: 4px solid;
      transition: transform 0.2s ease;
    }
    
    .section:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .section.classification {
      border-right-color: #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
    }
    
    .section.transcription {
      border-right-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
    }
    
    .section.metadata {
      border-right-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
    }
    
    .section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
    }
    
    .icon.classification { background: #10b981; }
    .icon.transcription { background: #3b82f6; }
    .icon.metadata { background: #f59e0b; }
    
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      font-weight: 500;
      font-size: 0.9rem;
      margin: 0.25rem;
    }
    
    .badge.primary {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    
    .badge.secondary {
      background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
      color: #374151;
      border: 2px solid #d1d5db;
    }
    
    .confidence-bar {
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 0.5rem;
      height: 8px;
    }
    
    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    
    .transcription-text {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      line-height: 1.8;
      font-size: 1.1rem;
      border: 2px solid #e5e7eb;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .metadata-item {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #e5e7eb;
    }
    
    .metadata-label {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }
    
    .metadata-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .footer {
      background: #f8fafc;
      padding: 1.5rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
      border-top: 2px solid #e5e7eb;
    }
    
    .decorative-element {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @media print {
      body { 
        background: white; 
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      .section:hover {
        transform: none;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="decorative-element" style="top: -50px; right: -50px;"></div>
      <h1>🎙️ نتائج التحليل الصوتي</h1>
      <p>تقرير شامل لمعالجة الصوت بالذكاء الاصطناعي</p>
      <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">تم الإنشاء في: ${currentDate}</p>
    </div>
    
    <div class="content">
      <div class="section classification">
        <h2>
          <span class="icon classification">🎯</span>
          التصنيف التلقائي
        </h2>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div class="badge primary">${category}</div>
          <div style="text-align: left; min-width: 120px;">
            <div style="font-size: 1.5rem; font-weight: bold; color: #10b981;">${confidence}%</div>
            <div style="font-size: 0.9rem; color: #6b7280;">مستوى الثقة</div>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width: ${confidence}%;"></div>
            </div>
          </div>
        </div>
        ${data.classification?.verified ? `
        <div style="margin-top: 1rem; padding: 1rem; background: #dcfce7; border-radius: 8px; border: 2px solid #bbf7d0;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: #166534; font-weight: 500;">
            ✅ التصنيف المُتحقق: ${data.classification.verified}
          </div>
        </div>
        ` : ''}
      </div>
      
      ${data.summary ? `
      <div class="section transcription">
        <h2>
          <span class="icon transcription">📝</span>
          ملخص المحادثة
        </h2>
        <div class="transcription-text">${data.summary}</div>
      </div>
      ` : ''}
      
      ${data.transcription ? `
      <div class="section transcription">
        <h2>
          <span class="icon transcription">🔤</span>
          النص المستخرج
        </h2>
        <div class="transcription-text">${data.transcription}</div>
      </div>
      ` : ''}
      
      <div class="section metadata">
        <h2>
          <span class="icon metadata">⚡</span>
          تفاصيل المعالجة
        </h2>
        <div class="metadata-grid">
          ${data.metadata?.duration ? `
          <div class="metadata-item">
            <div class="metadata-label">مدة التسجيل</div>
            <div class="metadata-value">⏱️ ${data.metadata.duration}</div>
          </div>
          ` : ''}
          ${data.metadata?.processingTime ? `
          <div class="metadata-item">
            <div class="metadata-label">وقت المعالجة</div>
            <div class="metadata-value">🚀 ${data.metadata.processingTime}</div>
          </div>
          ` : ''}
          ${data.metadata?.tokenCount ? `
          <div class="metadata-item">
            <div class="metadata-label">عدد الكلمات</div>
            <div class="metadata-value">📊 ${data.metadata.tokenCount}</div>
          </div>
          ` : ''}
          <div class="metadata-item">
            <div class="metadata-label">حالة المعالجة</div>
            <div class="metadata-value">✅ مكتمل</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>🤖 تم إنشاء هذا التقرير باستخدام تقنية Voice AI</p>
      <p>جميع النتائج تم معالجتها باستخدام خوارزميات الذكاء الاصطناعي المتقدمة</p>
    </div>
  </div>
</body>
</html>
  `;
};

const generateBatchHTML = (files: BatchFile[], currentDate: string): string => {
  const completedFiles = files.filter(f => f.transcription || f.summary);
  
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير الدفعة - Voice AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Tajawal', sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 2rem;
      color: white;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: shine 3s infinite;
    }
    
    @keyframes shine {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 1;
    }
    
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .content {
      padding: 2rem;
    }
    
    .file-card {
      margin-bottom: 2rem;
      background: #f8fafc;
      border-radius: 12px;
      overflow: hidden;
      border-right: 4px solid #6366f1;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .file-header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .file-name {
      font-size: 1.2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .file-body {
      padding: 1.5rem;
    }
    
    .classification-section {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 2px solid #bbf7d0;
    }
    
    .classification-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #065f46;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      font-weight: 500;
      font-size: 0.9rem;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    
    .summary-section {
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      border: 2px solid #bfdbfe;
    }
    
    .summary-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1e40af;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .summary-text {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      line-height: 1.8;
      border: 2px solid #e5e7eb;
    }
    
    .verified-badge {
      background: linear-gradient(135deg, #dcfce7, #f0fdf4);
      color: #166534;
      border: 2px solid #bbf7d0;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .footer {
      background: #f8fafc;
      padding: 1.5rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
      border-top: 2px solid #e5e7eb;
    }
    
    @media print {
      body { 
        background: white; 
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      .file-card:hover {
        transform: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 تقرير الدفعة الشامل</h1>
      <p style="font-size: 1.1rem; opacity: 0.9;">تحليل متقدم لمجموعة من الملفات الصوتية</p>
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-number">${completedFiles.length}</div>
          <div class="stat-label">📁 ملفات مكتملة</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${files.filter(f => f.classification?.verified).length}</div>
          <div class="stat-label">✅ ملفات مُتحققة</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Math.round((completedFiles.length / files.length) * 100)}%</div>
          <div class="stat-label">📈 معدل الإنجاز</div>
        </div>
      </div>
      <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">تم الإنشاء في: ${currentDate}</p>
    </div>
    
    <div class="content">
      ${completedFiles.map((file, index) => {
        const category = file.classification?.aiClassification || file.classification?.predicted || 'غير محدد';
        const confidence = file.classification?.confidence ? Math.round(file.classification.confidence * 100) : 0;
        
        return `
        <div class="file-card">
          <div class="file-header">
            <div class="file-name">
              📄 ملف رقم ${index + 1}: ${file.name}
            </div>
            <div style="font-size: 0.9rem; opacity: 0.9;">
              ${file.classification?.verified ? '✅ مُتحقق' : '⏳ قيد المراجعة'}
            </div>
          </div>
          
          <div class="file-body">
            <div class="classification-section">
              <div class="classification-title">
                🎯 التصنيف التلقائي
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div class="badge">${category}</div>
                <div style="text-align: left; color: #065f46;">
                  <div style="font-size: 1.3rem; font-weight: bold;">${confidence}%</div>
                  <div style="font-size: 0.8rem;">مستوى الثقة</div>
                </div>
              </div>
              ${file.classification?.verified ? `
              <div class="verified-badge">
                ✅ التصنيف المُتحقق: ${file.classification.verified}
              </div>
              ` : ''}
            </div>
            
            ${file.summary ? `
            <div class="summary-section">
              <div class="summary-title">
                📝 ملخص المحادثة
              </div>
              <div class="summary-text">${file.summary}</div>
            </div>
            ` : ''}
          </div>
        </div>
        `;
      }).join('')}
    </div>
    
    <div class="footer">
      <p>🤖 تم إنشاء هذا التقرير باستخدام تقنية Voice AI</p>
      <p>جميع النتائج تم معالجتها باستخدام خوارزميات الذكاء الاصطناعي المتقدمة</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const downloadBeautifulResults = (data: TranscriptionData | BatchFile[], filename: string = '', isBatch: boolean = false) => {
  const html = generateBeautifulHTML(data, isBatch);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `voice-ai-results-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};