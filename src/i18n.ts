import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Navigation
      appName: "صوت الذكي",
      tagline: "نسخ وتصنيف",
      dashboard: "لوحة التحكم",
      categories: "الفئات",
      history: "التاريخ",
      settings: "الإعدادات",
      
      // Main Page
      heroTitle: "نسخ الصوت والتصنيف",
      heroSubtitle: "ارفع أو سجل ملفات صوتية للنسخ التلقائي والتصنيف الذكي باستخدام تقنية الذكاء الاصطناعي المتقدمة",
      
      // Features
      recordOrUpload: "تسجيل أو رفع",
      recordUploadDesc: "سجل صوتك مباشرة أو ارفع ملفات صوتية بجودة عالية",
      aiProcessing: "معالجة الذكاء الاصطناعي",
      aiProcessingDesc: "تقنية متقدمة لنسخ الصوت وتصنيف المحتوى تلقائياً",
      customCategories: "فئات مخصصة",
      customCategoriesDesc: "أنشئ وأدر فئات تصنيف مخصصة حسب احتياجاتك",
      
      // Audio Input
      audioInput: "إدخال الصوت",
      startRecording: "بدء التسجيل",
      stopRecording: "إيقاف التسجيل",
      uploadFiles: "رفع الملفات",
      dragDropFiles: "اسحب وأسقط الملفات الصوتية هنا أو انقر للاختيار",
      supportedFormats: "صيغ مدعومة: MP3, WAV, M4A, OGG",
      selectCategory: "اختيار الفئة",
      selectForAll: "اختيار للكل",
      transcribeNow: "نسخ الآن",
      clearAll: "مسح الكل",
      recording: "جارٍ التسجيل",
      
      // Category Manager
      classificationCategories: "فئات التصنيف",
      manageCategoriesDesc: "أضف وأدر الفئات المخصصة لتصنيف تسجيلاتك الصوتية",
      addNewCategory: "إضافة فئة جديدة",
      addCategory: "إضافة فئة",
      noCategories: "لا توجد فئات بعد. أضف فئتك الأولى أعلاه.",
      edit: "تعديل",
      delete: "حذف",
      save: "حفظ",
      cancel: "إلغاء",
      
      // Email Options
      processingOptions: "خيارات المعالجة",
      processingDesc: "قد يستغرق هذا بعض الوقت. إذا كنت لا ترغب في الانتظار، يرجى إدخال بريدك الإلكتروني وسيتم إرسال النتائج إليك عند اكتمال المعالجة.",
      enterEmail: "أدخل بريدك الإلكتروني",
      emailPlaceholder: "name@example.com",
      sendByEmail: "إرسال بالبريد الإلكتروني",
      continueWithoutEmail: "المتابعة بدون بريد إلكتروني",
      
      // Processing
      processingAudio: "معالجة الصوت",
      listeningToCalls: "الاستماع للمكالمات...",
      takingDecision: "اتخاذ قرار بشأن المكالمات...",
      analyzingPatterns: "تحليل أنماط المحادثة...",
      processingContent: "معالجة المحتوى الصوتي...",
      applyingClassification: "تطبيق تصنيف الذكاء الاصطناعي...",
      
      // Results
      classificationResults: "نتائج التصنيف",
      resultsDesc: "مراجعة وتصدير نتائج التصنيف للملفات المعالجة",
      downloadResults: "تحميل النتائج",
      startOver: "بدء جديد",
      backToHome: "العودة للرئيسية",
      callId: "معرف المكالمة",
      fileName: "اسم الملف",
      transcribedText: "النص المكتوب",
      summary: "الملخص",
      classification: "التصنيف",
      noResultsFound: "لم يتم العثور على نتائج",
      noCompletedFiles: "لا توجد ملفات مكتملة للعرض. يرجى المحاولة مرة أخرى لاحقاً.",
      
      // Default Categories
      businessMeeting: "اجتماع عمل",
      personalNote: "ملاحظة شخصية",
      interview: "مقابلة",
      lecture: "محاضرة",
      phoneCall: "مكالمة هاتفية",
      brainstorming: "عصف ذهني",
      projectDiscussion: "نقاش مشروع",
      
      // Toast Messages
      categoryAdded: "تم إضافة الفئة بنجاح",
      categoryExists: "الفئة موجودة بالفعل",
      categoryDeleted: "تم حذف الفئة",
      categoryUpdated: "تم تحديث الفئة",
      emailSent: "تم إرسال البريد الإلكتروني بنجاح",
      invalidEmail: "عنوان بريد إلكتروني غير صحيح",
      resultsDownloaded: "تم تحميل النتائج بنجاح",
      noResultsToDownload: "لا توجد نتائج للتحميل",
      recordingStarted: "بدأ التسجيل",
      recordingStopped: "توقف التسجيل",
      microphoneError: "خطأ في الوصول للميكروفون",
      
      // File Status
      pending: "في الانتظار",
      processing: "قيد المعالجة",
      completed: "مكتمل",
      failed: "فشل",
      
      // Text Classifier
      textClassifier: "تصنيف النص",
      textClassifierDesc: "أدخل نص المحادثة مباشرة للحصول على تصنيف فوري باستخدام الذكاء الاصطناعي",
      conversationText: "نص المحادثة",
      conversationPlaceholder: "أدخل نص المحادثة هنا...\n\nمثال:\nمرحبا\nهلو\nالسلام عليكم\nمرحبا عليكم السلام\nيعطيك العافية كيف الحال\nالله يسلمك\nمعي الأخ فهد\nنعم فهد من شركة التحصيل...",
      classifyText: "تصنيف النص",
      classifying: "جارٍ التصنيف...",
      characters: "حرف",
      maxCharacters: "الحد الأقصى",
      classificationResult: "نتيجة التصنيف",
      textRequired: "نص المحادثة مطلوب",
      classificationCompleted: "تم التصنيف بنجاح",
      classificationError: "حدث خطأ في التصنيف",
      textInput: "إدخال النص",
      
      // Results Page
      backToVoiceInput: "العودة لإدخال الصوت",
      transcriptionResults: "نتائج النسخ",
      reviewTranscriptionContent: "راجع المحتوى المنسوخ وتصنيف الذكاء الاصطناعي",
      reviewAndVerifyResults: "راجع وتحقق من نتائج النسخ والتصنيف",
      share: "مشاركة",
      export: "تصدير",
      newTranscription: "نسخ جديد",
      newBatch: "مجموعة جديدة",
      exportResults: "تصدير النتائج",
      downloadTranscriptionResults: "تحميل نتائج النسخ والتصنيف بصيغة نص أو CSV",
      shareResults: "مشاركة النتائج",
      shareWithColleagues: "شارك نتائجك مع الزملاء أو احفظها في التخزين السحابي",
      processNewAudio: "معالجة صوت جديد",
      startNewSession: "بدء جلسة نسخ وتصنيف جديدة",
      batchResults: "نتائج المجموعة",
      file: "ملف",
      files: "ملفات",
      verificationUpdated: "تم تحديث التحقق",
      categoryVerifiedAs: "تم تأكيد الفئة كـ",
      
      // Review Page
      classificationComplete: "اكتمل التصنيف",
      callClassified: "مكالمة مصنفة",
      callsClassified: "مكالمات مصنفة",
      readyForExport: "جاهز للتصدير",
      noClassificationResults: "لم يتم العثور على نتائج التصنيف",
      noCompletedClassifications: "لا توجد تصنيفات مكتملة. قد تكون المعالجة لا تزال قيد التقدم",
      refreshResults: "تحديث النتائج",
      
      // Email Results Dialog
      emailResults: "إرسال النتائج بالبريد الإلكتروني",
      emailAddress: "عنوان البريد الإلكتروني",
      enterEmailAddress: "أدخل عنوان البريد الإلكتروني",
      subject: "الموضوع",
      emailPreview: "معاينة البريد الإلكتروني",
      defaultEmailSubject: "نتائج النسخ والتصنيف",
      sendEmail: "إرسال البريد الإلكتروني",
      sending: "جارٍ الإرسال...",
      transcriptionClassificationResults: "نتائج النسخ والتصنيف",
      totalFilesProcessed: "إجمالي الملفات المعالجة:",
      processingDate: "تاريخ المعالجة:",
      fileNumber: "ملف",
      summaryLabel: "الملخص:",
      noSummaryAvailable: "لا يوجد ملخص متاح",
      categoryLabel: "الفئة:",
      unclassified: "غير مصنف",
      confidenceLabel: "معدل الثقة:",
      emailRequired: "البريد الإلكتروني مطلوب",
      pleaseEnterEmail: "يرجى إدخال عنوان بريد إلكتروني",
      resultsSent: "تم إرسال النتائج",
      resultsSentTo: "تم إرسال النتائج إلى",
      sendFailed: "فشل الإرسال",
      failedToSendEmail: "فشل في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.",
      
      // Filename translations
      textConversationFilename: "محادثة-نص",
      conversationFile: "ملف محادثة",
      
      // Common
      loading: "جارٍ التحميل...",
      error: "خطأ",
      success: "نجح",
      warning: "تحذير",
      info: "معلومات"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;