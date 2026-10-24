SUPER AGENT PWA — v0.1
======================

এই ফোল্ডারে একটি মোবাইল-ফ্রেন্ডলি PWA প্রোটোটাইপ আছে।

যা কাজ করে:
- বাংলা/ইংরেজি চ্যাটের ডেমো রেসপন্স
- ব্রাউজার সমর্থন করলে Speech-to-Text (মাইক্রোফোন) ও Text-to-Speech
- Female/Male voice preference (কোন ভয়েস পাওয়া যাবে তা ডিভাইস/ব্রাউজারের ওপর নির্ভর করে)
- কাজের পরিকল্পনার ডেমো
- অনুমতি চাওয়ার ডায়ালগ
- অনুমতির পর একটি HTML starter file ডাউনলোড
- Service worker ও PWA manifest

যা এখনো নেই:
- পূর্ণ AI model/API integration
- লাইভ খবর বা web search
- সব প্রশ্নের জ্ঞানভিত্তিক উত্তর
- Android/Windows-এর অন্য অ্যাপ নিয়ন্ত্রণ
- অ্যাকাউন্ট, ফাইল বা অনলাইন সার্ভিসে স্বয়ংক্রিয় কাজ
- cloud sync বা স্থায়ী conversation memory

Android ফোনে পরীক্ষা করার সহজ উপায়:
1. ZIP ফাইল extract করুন।
2. ফোল্ডারের index.html ব্রাউজারে খুলে দেখতে পারেন; এতে chat demo চলবে।
3. মাইক্রোফোন, PWA install ও offline service worker-এর জন্য HTTPS hosting দরকার। ফোন থেকে একটি static hosting service-এ ফাইলগুলো upload করুন (যেমন GitHub Pages)।
4. HTTPS link Chrome-এ খুলুন। Chrome menu (⋮) → Add to Home screen / Install app।
5. মাইক্রোফোন চাইলে browser permission দিন।

গুরুত্বপূর্ণ:
- PWA install prompt সব hosting/browser-এ একইভাবে দেখা যায় না।
- Voice recognition সব Android browser-এ সমর্থিত নয় এবং অনেক ক্ষেত্রে ইন্টারনেট লাগে।
- Female/Male voice নির্বাচন browser-এ উপলব্ধ voice-এর ওপর নির্ভরশীল; সব ডিভাইসে বাংলা voice নাও থাকতে পারে।
- API secret কখনো frontend JavaScript-এ রাখবেন না। AI API যুক্ত করতে backend/proxy ব্যবহার করুন।
- কোনো বাস্তব কাজের আগে অনুমতি, যাচাই এবং undo/stop ব্যবস্থা রাখুন।
