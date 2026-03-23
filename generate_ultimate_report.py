import sys
import subprocess

def get_ar_what(title):
    t = title.lower()
    if "security" in t or "hardening" in t: return "تعزيز أمن النظام وسد الثغرات الأمنية."
    if "sqli" in t or "sql injection" in t: return "إغلاق ثغرات حقن SQL لحماية قاعدة البيانات."
    if "ssrf" in t: return "منع هجمات SSRF وحماية الشبكة الداخلية."
    if "csp" in t: return "تقوية سياسة أمن المحتوى (CSP) ضد السكربتات الخبيثة."
    if "rebrand" in t or "sofa" in t: return "تحويل العلامة التجارية بالكامل إلى Sofa Workspace."
    if "recap" in t: return "إضافة ميزة ملخصات المحادثات بالذكاء الاصطناعي."
    if "autotranslation" in t or "translate" in t: return "تفعيل ميزة الترجمة التلقائية الفورية للرسائل."
    if "arabic" in t or "rtl" in t: return "تحسين دعم اللغة العربية والواجهات (RTL)."
    if "audio" in t or "player" in t: return "تطوير مشغل الصوت ودعم الموجات الصوتية."
    if "ha" in t or "cluster" in t: return "تفعيل ميزة التوافر العالي والتشغيل المتعدد."
    if "test" in t or "playwright" in t: return "توسيع الاختبارات الآلية لضمان استقرار النظام."
    if "fix" in t: return f"إصلاح خطأ تقني في: {title}"
    return "تحديث تقني لتحسين استقرار ووظائف المنصة."

def get_ar_how(title):
    t = title.lower()
    if "security" in t or "hardening" in t: return "بتطبيق معايير أمنية مشددة وتحديث إعدادات السيرفر."
    if "sqli" in t or "sql injection" in t: return "باستخدام الاستعلامات الآمنة ومكتبة Squirrel."
    if "rebrand" in t or "sofa" in t: return "باستبدال النصوص والشعارات وتحديث مسارات الـ Go Modules."
    if "recap" in t: return "ببناء معالجات ذكية تستخرج النصوص وتلخصها عبر نماذج AI."
    if "arabic" in t or "rtl" in t: return "بتعديل ملفات CSS واستخدام الخصائص المنطقية للواجهة."
    if "ha" in t or "cluster" in t: return "بربط النظام بـ Redis لمزامنة البيانات بين الخوادم."
    return "بإجراء تعديلات في الكود المصدري وتحديث المنطق البرمجي."

# Read upstream
with open('commits_list.txt', 'r') as f:
    upstream = [l.strip() for l in f.readlines() if l.strip()]

# Get local (custom) commits
try:
    res = subprocess.check_output(['git', 'log', '--all', '--pretty=format:%h %s', '--reverse'], encoding='utf-8')
    local = [l.strip() for l in res.split('\n') if l.strip()]
except:
    local = []

all_commits = upstream + local
seen = set()
unique_commits = []
for c in all_commits:
    sha = c.split(' ')[0]
    if sha not in seen:
        unique_commits.append(c)
        seen.add(sha)

with open('ULTIMATE_COMMITS_REPORT_AR.md', 'w') as f:
    f.write("# تقرير Sofa Workspace: السجل الكامل للعمليات المدمجة\n\n")
    f.write(f"إجمالي العمليات: {len(unique_commits)} عملية.\n\n")
    for c in unique_commits:
        parts = c.split(' ', 1)
        if len(parts) < 2: continue
        sha, title = parts[0], parts[1]
        f.write(f"### [{sha}]: {title}\n")
        f.write(f"*   **ماذا عملت:** {get_ar_what(title)}\n")
        f.write(f"*   **كيف عملت:** {get_ar_how(title)}\n\n")

print(f"Total commits reported: {len(unique_commits)}")
