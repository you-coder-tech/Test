// انتظر حتى يتم تحميل كل شيء في الصفحة
document.addEventListener('DOMContentLoaded', () => {

    // --- منطق تبديل الثيمات ---
    const settingsIcon = document.getElementById('settings-icon');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const body = document.body;

    // عند الضغط على أيقونة الترس
    settingsIcon.addEventListener('click', () => {
        // اظهر القائمة أو اخفيها
        themeMenu.classList.toggle('hidden');
    });

    // عند اختيار ثيم من القائمة
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedTheme = option.getAttribute('data-theme');
            
            // قم بإزالة كل كلاسات الثيمات القديمة
            body.classList.remove('theme-dark', 'theme-green', 'theme-neon');
            
            // أضف كلاس الثيم الجديد
            body.classList.add(selectedTheme);
            
            // اخفي القائمة بعد الاختيار
            themeMenu.classList.add('hidden');
        });
    });

    // إخفاء قائمة الثيمات إذا تم الضغط في أي مكان آخر في الصفحة
    document.addEventListener('click', (event) => {
        if (!settingsIcon.contains(event.target) && !themeMenu.contains(event.target)) {
            themeMenu.classList.add('hidden');
        }
    });

    console.log("تم تحميل نظام الثيمات والأقسام الجديدة بنجاح!");
});
