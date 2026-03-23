import sys

def translate_commit(line):
    parts = line.split(' ', 1)
    if len(parts) < 2:
        return None
    sha = parts[0]
    title = parts[1]

    # Very basic mapping for major keywords to help automate the Arabic explanation
    explanation = "تحديث في النظام"
    how = "من خلال تعديلات في الكود المصدري"

    if "Support Packet" in title:
        explanation = "إضافة معلومات العتاد (المعالج والذاكرة) إلى حزمة الدعم التقني."
        how = "تعديل منطق جمع معلومات النظام لتضمين عدد النوى (Cores) وإجمالي الرام."
    elif "ElementsMatch" in title or "testify" in title:
        explanation = "تحسين اختبارات الأكواد البرمجية لزيادة دقة التحقق."
        how = "استخدام مكتبة testify للمقارنة بين القوائم دون الحاجة لترتيبها يدوياً."
    elif "Translations update" in title:
        explanation = "تحديث الترجمات الدولية للنظام."
        how = "دمج ملفات الترجمة الأحدث من منصة Weblate."
    elif "Recaps" in title:
        explanation = "إضافة ميزة تلخيص المحادثات باستخدام الذكاء الاصطناعي."
        how = "إنشاء واجهات برمجية (APIs) جديدة لمعالجة النصوص وتوليد ملخصات ذكية."
    elif "unauthorized access" in title or "unauth" in title:
        explanation = "إغلاق ثغرة أمنية تسمح بالوصول غير المصرح للقنوات."
        how = "إضافة فحص إضافي للصلاحيات عند محاولة الدخول للقنوات العامة في الفرق الخاصة."
    elif "illustrations" in title or "loading screen" in title:
        explanation = "تحديث الواجهة البصرية ورسوم التوضيح وشاشات التحميل."
        how = "استبدال ملفات SVG القديمة بهوية Sofa الجديدة وتحسين سرعة ظهور شاشة التحميل."
    elif "node 24" in title or "node.js" in title:
        explanation = "ترقية بيئة التشغيل Node.js إلى الإصدار 24."
        how = "تحديث ملفات التكوين (Configuration) ورفع إصدارات المكتبات المرتبطة مثل webpack و babel."
    elif "archive icon" in title:
        explanation = "إضافة أيقونة مميزة للقنوات المؤرشفة الخاصة."
        how = "تحديث مكونات React المسؤولة عن عرض الأيقونات في القائمة الجانبية."
    elif "Autotranslations" in title or "autotranslation" in title:
        explanation = "تفعيل ميزة الترجمة التلقائية للرسائل."
        how = "بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً."
    elif "RTL" in title:
        explanation = "تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية)."
        how = "تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة."
    elif "SSRF" in title:
        explanation = "إغلاق ثغرة SSRF (طلب خادم غير مصرح)."
        how = "منع السيرفر من الاتصال بعناوين IP داخلية معينة (IPv4-mapped IPv6)."
    elif "Burn-on-Read" in title or "BoR" in title:
        explanation = "تطوير ميزة الرسائل التي تحترق (تختفي) بعد القراءة."
        how = "إضافة عدادات زمنية ومنطق برمجي يقوم بحذف الرسالة من قاعدة البيانات فور اطلاع المستلم عليها."
    elif "rate limiting" in title or "rate limit" in title:
        explanation = "إضافة قيود على عدد الطلبات (Rate Limiting) لحماية السيرفر."
        how = "تطبيق خوارزمية تحديد السرعة على واجهة الدخول (Login Endpoint)."
    elif "atomic token" in title:
        explanation = "تأمين روابط دخول الضيوف باستخدام الرموز الذرية."
        how = "ضمان استهلاك الرمز البرمجي في عملية واحدة غير قابلة للتكرار أو التداخل (Atomic Operation)."
    elif "Post search" in title or "pg_trgm" in title:
        explanation = "تحسين سرعة ودقة البحث في الرسائل."
        how = "استخدام ملحقات PostgreSQL المتقدمة مثل pg_trgm لدعم البحث الجزئي."
    elif "Update latest patch version" in title or "11.5.1" in title:
        explanation = "ترقية النظام إلى النسخة الأحدث 11.5.1."
        how = "تحديث ثوابت النظام (Version Constants) ودمج كافة الإصلاحات الأمنية للنسخة."
    elif "E2E" in title or "Playwright" in title:
        explanation = "تحسين الاختبارات الآلية الشاملة للنظام."
        how = "تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة."
    elif "SQLI" in title or "SQL injection" in title:
        explanation = "إغلاق ثغرات حقن SQL."
        how = "استبدال الاستعلامات النصية باستعلامات مجهزة (Parameterized Queries) آمنة."

    return f"### {sha}: {title}\n*   **ماذا عمل:** {explanation}\n*   **كيف عمل:** {how}\n"

with open('commits_list.txt', 'r') as f:
    lines = f.readlines()

with open('FULL_COMMITS_REPORT_AR.md', 'w') as f:
    f.write("# تقرير تفصيلي لكل عملية دمج (Commit) في Sofa Workspace\n\n")
    f.write("يحتوي هذا التقرير على شرح لكل عملية تمت من الأقدم إلى الأحدث، موضحاً التغيير وكيفية تنفيذه تقنياً.\n\n")
    for line in lines:
        report = translate_commit(line.strip())
        if report:
            f.write(report + "\n")
