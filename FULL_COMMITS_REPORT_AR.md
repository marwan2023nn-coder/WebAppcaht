# تقرير تفصيلي لكل عملية دمج (Commit) في Sofa Workspace

يحتوي هذا التقرير على شرح لكل عملية تمت من الأقدم إلى الأحدث، موضحاً التغيير وكيفية تنفيذه تقنياً.

### 43bfdbfd1b: [MM-66840] Add CPU cores and total memory to Support Packet (#34658)
*   **ماذا عمل:** إضافة معلومات العتاد (المعالج والذاكرة) إلى حزمة الدعم التقني.
*   **كيف عمل:** تعديل منطق جمع معلومات النظام لتضمين عدد النوى (Cores) وإجمالي الرام.

### 65d69b0498: Use testify ElementsMatch instead of sorting slices before comparison (#34899)
*   **ماذا عمل:** تحسين اختبارات الأكواد البرمجية لزيادة دقة التحقق.
*   **كيف عمل:** استخدام مكتبة testify للمقارنة بين القوائم دون الحاجة لترتيبها يدوياً.

### 9e1d4c2072: Translations update from Mattermost Weblate (#34918)
*   **ماذا عمل:** تحديث الترجمات الدولية للنظام.
*   **كيف عمل:** دمج ملفات الترجمة الأحدث من منصة Weblate.

### 8e4cadbc88: [MM-66359] Recaps MVP (#34337)
*   **ماذا عمل:** إضافة ميزة تلخيص المحادثات باستخدام الذكاء الاصطناعي.
*   **كيف عمل:** إنشاء واجهات برمجية (APIs) جديدة لمعالجة النصوص وتوليد ملخصات ذكية.

### a18b80ba4c: MM-67049: Fix unauthorized access to public channels in private teams (#34886)
*   **ماذا عمل:** إغلاق ثغرة أمنية تسمح بالوصول غير المصرح للقنوات.
*   **كيف عمل:** إضافة فحص إضافي للصلاحيات عند محاولة الدخول للقنوات العامة في الفرق الخاصة.

### 7ea7b3384f: [MM-67081] [MM-62584] Updates to illustrations and loading screen (#34855)
*   **ماذا عمل:** تحديث الواجهة البصرية ورسوم التوضيح وشاشات التحميل.
*   **كيف عمل:** استبدال ملفات SVG القديمة بهوية Sofa الجديدة وتحسين سرعة ظهور شاشة التحميل.

### 92339d03ab: [MM-67044] Update connected workspaces empty state illustrations (#34820)
*   **ماذا عمل:** تحديث الواجهة البصرية ورسوم التوضيح وشاشات التحميل.
*   **كيف عمل:** استبدال ملفات SVG القديمة بهوية Sofa الجديدة وتحسين سرعة ظهور شاشة التحميل.

### dab04576a1: MM-66972 Upgrade to node 24 and main dependencies with babel, webpack and jest (#34760)
*   **ماذا عمل:** ترقية بيئة التشغيل Node.js إلى الإصدار 24.
*   **كيف عمل:** تحديث ملفات التكوين (Configuration) ورفع إصدارات المكتبات المرتبطة مثل webpack و babel.

### cf1682a0e7: Add documentation for plugin RPC architecture (#34587)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### cc2b47bc9b: MM-66561 Add distinct archive icon for private channels (#34736)
*   **ماذا عمل:** إضافة أيقونة مميزة للقنوات المؤرشفة الخاصة.
*   **كيف عمل:** تحديث مكونات React المسؤولة عن عرض الأيقونات في القائمة الجانبية.

### 0885f56010: Add optional Claude.md orchestration for Webapp folder (#34668)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 52411cf613: Migrate UserList to a function component (#34511)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 688e0c6c4e: Update en.json (#34935)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 38b413a276: MM-67077: Remove PSD file previews (#34898)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 0a12ca2f7d: E2E/Playwright: Reorganize user and team creation (#34912)
*   **ماذا عمل:** تحسين الاختبارات الآلية الشاملة للنظام.
*   **كيف عمل:** تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة.

### 53975de036: MM-66671 Migrate tests to RTL, batches E1 and E2 (#34506)
*   **ماذا عمل:** تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية).
*   **كيف عمل:** تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة.

### 9268d4b1d0: MM-66672 Migrate tests to RTL (#34508)
*   **ماذا عمل:** تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية).
*   **كيف عمل:** تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة.

### 53feec3e79: MM-66674 - Updating alignment for GenericModal (#34861)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### be3b5d4b7c: MM-66092 - enhance user permissions data structure validations (#34654)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b097098af3: MM-64942 - Fixing default error bookmarks bar (#34869)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### f00dd11e34: [MM-67138][MM-67139] Update Audit/Activity logging for Desktop App external auth (#34928)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 4773d0fc6f: MM-64655 - Updating mobile RHS (#34007)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 2a8b2069f5: chore: Update NOTICE.txt file with updated dependencies (#34969)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### bb8c2660ed: Translations update from Mattermost Weblate (#34977)
*   **ماذا عمل:** تحديث الترجمات الدولية للنظام.
*   **كيف عمل:** دمج ملفات الترجمة الأحدث من منصة Weblate.

### b8c9f931bb: Update package-lock.json (#34958)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 0ace6a45cd: Update prepackaged Jira plugin to v4.5.1 (#34978)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### c62d103d76: [MM-67160] Add audit logging for recap API endpoints (#34929)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b2f93dec1a: [MM-67118] Add Agents to @ mention autocomplete in channel (#34881)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b5a816a657: Add audits for accessing posts without membership (#31266)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 28bcb6394b: fix(webapp): bundle loading screen CSS with content hash (#34930)
*   **ماذا عمل:** تحديث الواجهة البصرية ورسوم التوضيح وشاشات التحميل.
*   **كيف عمل:** استبدال ملفات SVG القديمة بهوية Sofa الجديدة وتحسين سرعة ظهور شاشة التحميل.

### 3ebc90bde0: fix: E2E/Tests related to create account and invite people (#34953)
*   **ماذا عمل:** تحسين الاختبارات الآلية الشاملة للنظام.
*   **كيف عمل:** تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة.

### 5e99f12c3a: MM-67119: Remove unused Channel.Etag (#34951)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### fde4393144: Update web app package versions to 11.4.0 (#35003)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### dcda5304ff: Suppress SiteURL log error when in CI or local_testing mode (#34982)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 41e5c7286b: Remove vestigial MySQL support (#34865)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 86024cb4cc: Update runtime chainguard image for fips (#34997)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### fa399a5b05: Remove most unused props (#34979)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### ed3a7e8539: Add trigger field to command execution logs (#34950)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### c01e9f791f: [MM-67189] loading screen fixes - move measureAndReport, reduce minimum time, fix z-index issue (#34947)
*   **ماذا عمل:** تحديث الواجهة البصرية ورسوم التوضيح وشاشات التحميل.
*   **كيف عمل:** استبدال ملفات SVG القديمة بهوية Sofa الجديدة وتحسين سرعة ظهور شاشة التحميل.

### fcd3ebcb31: fix(scheduled): enhance timezone formatting by incorporating user loc… (#34305)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### d695a0db7a: MM-67111-Remove Cancel button on User Attributes page (#34945)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 66e5ab4c5e: E2E/Test Playwright upgrade (#35008)
*   **ماذا عمل:** تحسين الاختبارات الآلية الشاملة للنظام.
*   **كيف عمل:** تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة.

### 3a394b25e4: Bumping version of prepackaged Gitlab plugin to 1.12.0 (#35033)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 09c4a61fed: [MM-67030] Remove newsletter signup and replace with terms/privacy agreement (#34801)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 777867dc36: Define types for WebSocket messages and migrate WebSocket actions to TS (#34603)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 9efe617be8: MM-67055: Fix permalink embeds in WebSocket messages (#34893)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 37ec26b81a: MM-61383 - add back offline user help for messagging (#34756)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 86797c508c: update mscfb and msoleps indirect dependencies to fix oom vuln. (#34910)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 7bbf8c71a2: Add missing check (#35034)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b62727e091: [MM-67290] Document that Elasticsearch backend type change requires server restart (#35038)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### df00184250: fix merge defect on server/channels/app/post_test.go (#35057)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### a1c85007e1: Autotranslations MVP (#34696)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 7b1c32e34c: MM-67725: (test) Migrate enzyme to RTL (#34966)
*   **ماذا عمل:** تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية).
*   **كيف عمل:** تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة.

### c537b88f93: MM-65023 Add tooltip to actions buttons, display error (#33773)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 3db7477e45: MM-67281: (test) Migrate Enzyme to RTL (#35029)
*   **ماذا عمل:** تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية).
*   **كيف عمل:** تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة.

### ace5810d65: Update file_preview.js (#35028)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 8ff88242a9: chore: Update NOTICE.txt file with updated dependencies (#35053)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### c6b205f0d7: Fixed WS payload for post burn event (#34936)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 4cd9a266f8: Update the FIPS flavour of Boards to v9.2.2 (#35064)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### dfbe788732: [MM-64365] omit group constrained channels from the ch. selector for ABAC (#35010)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 8e7b3da702: Fixtures that allow install of a plugin from a target repo (#34520)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 89a29ce3c2: MM-66167 fix (#35061)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### ced9a56e39: [MM-67126] Deprecate UpdateAccessControlPolicyActiveStatus API in favor of new one (#34940)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 3388093c00: updates opensearch library dependency and adds tests for caused_by error reason returned (#34826)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### fbe5ad0ea2: [MM-66591] Channel Summarization - header icon pluggable + citation support (#34687)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### fe3052073d: [MM-67074] Integration Action memory use fix (#34896)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### ea9333b2e8: Translations update from Mattermost Weblate (#35055)
*   **ماذا عمل:** تحديث الترجمات الدولية للنظام.
*   **كيف عمل:** دمج ملفات الترجمة الأحدث من منصة Weblate.

### eeaf9c8e3e: Fix bad merge (#35079)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### fb22f56635: MM-67269 - Fix popout windows for subpath deployments (#35027)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 320b3b411f: adds detailed error message to ES test connection (#35009)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 73d7e66e97: Bump playbooks to v2.6.2 (#35077)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b2eb45e615: Add missing auditRec.Success calls; fix missing return on error. (#34954)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 67b8c89508: MM-67130: Fix permalink preview permissions (#34909)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 7417d07733: Test/RTL: Use userEvent as much as possible and remove unneeded jest.clearAllMocks() (#35070)
*   **ماذا عمل:** تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية).
*   **كيف عمل:** تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة.

### 62df0b0417: Update the FIPS flavour of Playbooks to v2.6.2 (#35096)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 4195b8bc5c: Metrics for Autotranslations (#34900)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 5d787969c2: MM-67268: Fix SSRF bypass via IPv4-mapped IPv6 literals (#35097)
*   **ماذا عمل:** إغلاق ثغرة SSRF (طلب خادم غير مصرح).
*   **كيف عمل:** منع السيرفر من الاتصال بعناوين IP داخلية معينة (IPv4-mapped IPv6).

### 2b075c9b74: MM-65970: New way to build routes in Client4 (#34499)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 36173a4948: Use one timeout config for requests to translation providers (#34957)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 168fb51666: [MM-67202] Validate auth method in account switch (#34981)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 7201f42d95: MM-67277: Add check to legacy hasher (#35092)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 1346cf529a: MM-67274: Fix panic in getBrowserVersion with empty User-Agent version (#35098)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 7f6a98fd7a: MM-66789 Restrict log downloads to a root path for support packets (#35014)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 1c1a445a3e: MM-67380: COALESCE Drafts.Type to the empty string if NULL (#35109)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### fe4100956c: [MM-66581] Include some thread context in AI Rewrites prompt (#34931)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 90bdd6ae54: MM-67141 Update AI rewrite prompt guidance (#35011)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 5bb5261c72: MM-67279: Fix private channel enumeration via /mute slash command (#35099)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 3321db82c3: Bumping prepackaged version of MS Teams Meetings plugin to 2.4.0 (#35146)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 288816834d: Bump playbooks to v2.7.0 (#35150)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 8db2ef6b9f: MM-67365 - adjust bor icons and priority labels in compact mode (#35121)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 981ff0bc46: MM-66362 feat: run e2e full tests after successful smoke tests both in cypress and playwright (#34868)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### dc69319c67: Moved flag post option before delete post (#35019)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 990e9b34bf: Removed initial BOR post reveal WS event for post author (#34939)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b74b5fe83f: chore: Update NOTICE.txt file with updated dependencies (#35158)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 70a50edcf2: [MM-67021] Fix 500 errors on check-cws-connection in non-Cloud environments (#34786)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 6f9b6f3364: Translations update from Mattermost Weblate (#35159)
*   **ماذا عمل:** تحديث الترجمات الدولية للنظام.
*   **كيف عمل:** دمج ملفات الترجمة الأحدث من منصة Weblate.

### 4049300129: Change moduleResolution to bundler for web app (#35081)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 95ba2db4f0: [MM-66862] Channel Info RHS: add ability to rename and open channel settings (#34708)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 36479bd721: Configurable workers and move sweeper job to job infra (#35007)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### f3c6602725: Allow building the server on FreeBSD (#25838)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### aa5d51131d: Register product icon change (#34883)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 0263262ef4: MM-66577 Preserve locale in rewrite prompt (#35013)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 51e6431275: MM-67328 Bulk migrate Enzyme to RTL (M2 to M6) (#35068)
*   **ماذا عمل:** تحسين دعم الواجهات التي تبدأ من اليمين لليسار (مثل العربية).
*   **كيف عمل:** تعديل ملفات CSS واستخدام الخصائص المنطقية (Logical Properties) لضمان المحاذاة الصحيحة.

### e499decea0: (test): fix flaky and migrate to playwright (#35156)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 030a4e1921: Update latest minor version to 11.5.0 (#35176)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 67226f32a4: Avoid `simple` config when doing FTS in Postgres (#35063)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 4887c501e1: chore: Update zoom version to 1.12.0 (#35167)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 5a408b757c: (fix): verified by label and playwright rerun on failed specs (#35161)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 444ada7251: Update en.json (#35160)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### a06d5065e7: apply view restrcitions while fetching group members (#35172)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 1273632d1a: Add endpoint to update channel member autotranslations (#35072)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 22e4e9c171: Improve mmctl output by filtering escape sequences (#35191)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 9ac02ecfdd: Update translation primary key to include objectType (#35040)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### c31fe3f244: invalidate channel cache after deleting a channel access control policy (#35174)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 197fa160b4: [MM-67126] harden checks (#35171)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### f6574143a8: Document URL search in Postgres through tests (#35194)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 2bd29c0359: Add the ability to patch channel autotranslations (#35078)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 9f40d051ee: [MM-66942] Ensure consistent option ID generation across all field creation paths (#34725)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 63c3c70fe9: [MM-66836] Add some access control mechanisms with a wrapper around the property service (#34812)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 1cfe3d92b6: [MM-66836] Integrate PropertyAccessService into API and app layers (#34818)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### a995682464: [MM-66836] Add UI support for protected and source_only property fields (#34860)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 892492a0a8: [MM-66836] Add ability to delete orphaned protected fields from uninstalled plugins (#34867)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 139ff4ded2: Fix permissions in GetGroupsByNames (#35119)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### bffe406e9f: (chore): upgrade playwright and its dependencies (#35175)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b947f1c38a: Add fileSize limit to extractors (#35200)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 13a0d63b3c: MM-67372: Improve link preview metadata handling and filtering (#35178)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### bdbe2f1374: Translations update from Mattermost Weblate (#35213)
*   **ماذا عمل:** تحديث الترجمات الدولية للنظام.
*   **كيف عمل:** دمج ملفات الترجمة الأحدث من منصة Weblate.

### 3a68fb9efc: MM-67430 - Removing artificial spacing from modal (#35173)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 74b5fb066c: MM-67022 - Implement ExpireAt handling for BoR sender to persist countdown (#34796)
*   **ماذا عمل:** تطوير ميزة الرسائل التي تحترق (تختفي) بعد القراءة.
*   **كيف عمل:** إضافة عدادات زمنية ومنطق برمجي يقوم بحذف الرسالة من قاعدة البيانات فور اطلاع المستلم عليها.

### 76b3528c2b: [MM-67231] Etag fixes for autotranslations (#35196)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### d2992fec8f: [MM-67502] Sanitize secret plugin settings inside sections (#35214) (#35227)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 9aeb529f67: [MM-67114] Add mmctl license get command (#34878) (#35228)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### ca3c048334: Bumping prepackaged version of GitHub plugin (#35223) (#35233)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 3a652e19b3: MM-67137 Fix references to window in client package  (#35195) (#35234)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 2b7e73eaef: MM-67538 Add ability for plugins to load asynchronously (#35238) (#35241)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 6a8f3e4cdc: Autotranslation Frontend integration (#34717) (#35235)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 19c93ff7ca: MM-67335 Fix export files having mismatched permissions (#35182) (#35244)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 65022587e0: MM-66789: Include log viewer (system console) in log root path validation (#35221) (#35261)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 8305aa2b1e: Changes for BoR post soft-deletion (#35100) (#35262)
*   **ماذا عمل:** تطوير ميزة الرسائل التي تحترق (تختفي) بعد القراءة.
*   **كيف عمل:** إضافة عدادات زمنية ومنطق برمجي يقوم بحذف الرسالة من قاعدة البيانات فور اطلاع المستلم عليها.

### 37cca32fc9: MM-67312: Restrict Burn-on-Read for self DMs and bot users (#35116) (#35266)
*   **ماذا عمل:** تطوير ميزة الرسائل التي تحترق (تختفي) بعد القراءة.
*   **كيف عمل:** إضافة عدادات زمنية ومنطق برمجي يقوم بحذف الرسالة من قاعدة البيانات فور اطلاع المستلم عليها.

### 7247965146: [MM-67487] Fix posts since endpoint for auto translations (#35198) (#35294)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 0de8353158: MM-66886 Add rate limiting to login endpoint (#34943) (#35310)
*   **ماذا عمل:** إضافة قيود على عدد الطلبات (Rate Limiting) لحماية السيرفر.
*   **كيف عمل:** تطبيق خوارزمية تحديد السرعة على واجهة الدخول (Login Endpoint).

### 3571847419: [MM-67488] Set autotranslation feature flag default to true (#35288) (#35317)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 86ff1d0ad1: Mm 66813 sso callback metadata (#34955) (#35319)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 35408e8b14: MM-67099 - Membership Sync fix (#35230) (#35322)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### cd1fe0a98f: Rename "Self-Deleting Messages" to "Burn-on-Read Messages" (#35318) (#35331)
*   **ماذا عمل:** تطوير ميزة الرسائل التي تحترق (تختفي) بعد القراءة.
*   **كيف عمل:** إضافة عدادات زمنية ومنطق برمجي يقوم بحذف الرسالة من قاعدة البيانات فور اطلاع المستلم عليها.

### 1ec0bcbedd: fix guest user import when guest user doesn't have any memberships (#30975) (#35344)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### d1f1eed2a1: separate websocket event for translations metrics (#35296) (#35345)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 4efbe7ca13: [MM-67531] Add beta label to auto translations feature (#35284) (#35347)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 2fc50134eb: [MM-67530] Only show autotranslation permissions to licensed users (#35283) (#35348)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 2f83be03b0: [MM-67563] Change websocket format for translation update events (#35268) (#35350)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### a7a62fdc60: SEC-9513 feat: e2e tests on master and releases (#35205) (#35364)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### e6e3ef395b: E2E/Test: Increase parallel tests and removed smoke tests (#35271) (#35367)
*   **ماذا عمل:** تحسين الاختبارات الآلية الشاملة للنظام.
*   **كيف عمل:** تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة.

### 9b38d83f16: libre key fix (#35297) (#35357)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### c94ee4192b: [MM-67564] Reduce channel banner height to 24px with 13px font (#35338) (#35370)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### ee4d5c34c3: [MM-67565] Prevent setting protected=true on fields without source_plugin_id (#35265) (#35377)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 11b4428fc3: [MM-67605] Add DCR redirect URI allowlist for OAuth DCR (#35291) (#35394)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 56a549db4b: MM-67522 Add tests for syncing user statuses (#35269) (#35400)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 01d3155308: GetAllForObject, use Master instead of replica (#35356) (#35396)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 6e28371d19: [MM-67587] Exclude system messages from autotranslation queue (#35267) (#35397)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 67a5ad08ed: update default worker count for autotranslations (#35355) (#35398)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 094f2c06ce: [MM-67671] Add CJK Post search support for PostgreSQL (#35260) (#35426)
*   **ماذا عمل:** تحسين سرعة ودقة البحث في الرسائل.
*   **كيف عمل:** استخدام ملحقات PostgreSQL المتقدمة مثل pg_trgm لدعم البحث الجزئي.

### e7c8eb43da: bumps base image version to build new mattermost-build-server images (#35281) (#35430)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 06a7d6b9dc: [MM-67235] Add support for autotranslations on GM and DM (#35255) (#35428)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 1177c08b29: update edwards25519 (#35425)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 24bdd773d9: bumps go version to 1.24.13 (#35289) (#35429)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### f1e1707c9e: Update plugin-calls to v1.11.1 (#35427) (#35434)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 77b8a956a9: MM-67659 Fix marking threads as read over the WebSocket (#35384) (#35438)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 3b35529580: [MM-67640] Fix checks around autotranslations permission (#35351) (#35444)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### a39e25ec87: Prepackage Playbooks FIPS v2.7.0 (#35450)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 5e1cadac42: fix: MM-T388 E2E tests (#35470)
*   **ماذا عمل:** تحسين الاختبارات الآلية الشاملة للنظام.
*   **كيف عمل:** تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة.

### fe45be286e: Fix E2E-only PRs and duplicate E2E test runs after PR merges (#35368) (#35473)
*   **ماذا عمل:** تحسين الاختبارات الآلية الشاملة للنظام.
*   **كيف عمل:** تحديث سكربتات Playwright لاختبار واجهة المستخدم بشكل أكثر كفاءة.

### 9f26163765: fix: webhook server connection error in cypress (#35471) (#35474)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### b168715e7a: Update latest patch version to 11.5.1 (#35480)
*   **ماذا عمل:** ترقية النظام إلى النسخة الأحدث 11.5.1.
*   **كيف عمل:** تحديث ثوابت النظام (Version Constants) ودمج كافة الإصلاحات الأمنية للنسخة.

### 87f419f917: [MM-67677] Adjust max autotranslations workers to 64 (#35463) (#35486)
*   **ماذا عمل:** تفعيل ميزة الترجمة التلقائية للرسائل.
*   **كيف عمل:** بناء نظام خلفي (Backend) يتعامل مع مزودي الترجمة ومعالجة الرسائل الواردة فورياً.

### 0dba8699e0: fix: only match root-level JSONL files when importing a zip (#35481) (#35491)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### 7944f65d65: Use standard session handler for updateUserAuth endpoint (#35488) (#35502)
*   **ماذا عمل:** تحديث في النظام
*   **كيف عمل:** من خلال تعديلات في الكود المصدري

### c2d85727d2: [MM-67791] Use atomic token consumption for guest magic links (#35489) (#35506)
*   **ماذا عمل:** تأمين روابط دخول الضيوف باستخدام الرموز الذرية.
*   **كيف عمل:** ضمان استهلاك الرمز البرمجي في عملية واحدة غير قابلة للتكرار أو التداخل (Atomic Operation).
