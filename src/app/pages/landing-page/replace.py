import re

file_path = "/Users/softlabit/Documents/gurdian/Guardian-Publication-UI-2.0/src/app/pages/landing-page/landing-page.component.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (r"অর্ডার করুন", r"{{ 'ln.LP_OrderNow' | translate }}"),
    (r"মাত্র ৳", r"{{ 'ln.LP_OnlyTaka' | translate }}"),
    (r"\% ছাড়!", r"% {{ 'ln.LP_Off' | translate }}"),
    (r"সরাসরি অর্ডার করুন", r"{{ 'ln.LP_OrderDirectly' | translate }}"),
    (r"একটু পড়ে দেখুন", r"{{ 'ln.LP_ReadPreview' | translate }}"),
    (r"বইগুলোর ভেতরের কিছু পৃষ্ঠা", r"{{ 'ln.LP_InsidePages' | translate }}"),
    (r"বইগুলোর প্রিন্টিং মান এবং সূচিপত্র এক নজরে দেখে নিতে পারেন", r"{{ 'ln.LP_InsidePagesSubtitle' | translate }}"),
    (r"নির্বাচিত ✓", r"{{ 'ln.LP_Selected' | translate }}"),
    (r"নির্বাচন করুন", r"{{ 'ln.LP_Select' | translate }}"),
    (r"বইটি কাদের জন্য\?", r"{{ 'ln.LP_WhoIsThisFor' | translate }}"),
    (r"বইয়ের ভিতরের কিছু পৃষ্ঠা", r"{{ 'ln.LP_InsidePagesSingle' | translate }}"),
    (r"বিস্তারিত দেখুন", r"{{ 'ln.LP_ViewDetails' | translate }}"),
    (r"ফ্রি", r"{{ 'ln.LP_Free' | translate }}"),
    (r"বাঁচবে ৳", r"{{ 'ln.LP_SaveTaka' | translate }}"),
    (r"আরও কম্বো দেখুন", r"{{ 'ln.LP_ViewMoreCombos' | translate }}"),
    (r"এই কম্বোর", r"{{ 'ln.LP_ComboBooksPart1' | translate }}"),
    (r"বইগুলো আলাদাভাবে কিনতে চান\?", r"{{ 'ln.LP_ComboBooksPart2' | translate }}"),
    (r"অর্ডারে যোগ করুন", r"{{ 'ln.LP_AddToOrder' | translate }}"),
    (r"বিশাল সুযোগ", r"{{ 'ln.LP_HugeOpportunity' | translate }}"),
    (r"আপনার পছন্দের বই বেছে নিন", r"{{ 'ln.LP_ChooseFavoriteBooks' | translate }}"),
    (r"আপনার অর্ডার", r"{{ 'ln.LP_YourOrder' | translate }}"),
    (r"টি বই", r"{{ 'ln.LP_BooksCount' | translate }}"),
    (r"ডেলিভারি চার্জ", r"{{ 'ln.LP_DeliveryCharge' | translate }}"),
    (r"সর্বমোট", r"{{ 'ln.LP_Total' | translate }}"),
    (r"আরও ৳", r"{{ 'ln.LP_OrderMoreTaka' | translate }}"),
    (r"অর্ডার করলে ফ্রি ডেলিভারি পাবেন!", r"{{ 'ln.LP_ToGetFreeDelivery' | translate }}"),
    (r"অর্ডার করতে আপনার তথ্য দিন", r"{{ 'ln.LP_ProvideInfoToOrder' | translate }}"),
    (r"নাম লিখুন \*", r"{{ 'ln.LP_EnterName' | translate }}"),
    (r"আপনার নাম দেওয়া আবশ্যক", r"{{ 'ln.LP_NameRequired' | translate }}"),
    (r"মোবাইল নম্বর \*", r"{{ 'ln.LP_MobileNumber' | translate }}"),
    (r"১১ ডিজিটের সঠিক মোবাইল নম্বর দিন \(যেমন: 017XXXXXXXX\)", r"{{ 'ln.LP_ValidMobileRequired' | translate }}"),
    (r"ঢাকার ভেতরে", r"{{ 'ln.LP_InsideDhaka' | translate }}"),
    (r"ঢাকার বাইরে", r"{{ 'ln.LP_OutsideDhaka' | translate }}"),
    (r"ঠিকানা লিখুন \*", r"{{ 'ln.LP_EnterAddress' | translate }}"),
    (r"আপনার পূর্ণাঙ্গ ঠিকানা দেওয়া আবশ্যক", r"{{ 'ln.LP_AddressRequired' | translate }}"),
    (r"Cash on Delivery<br />\(ক্যাশ অন ডেলিভারি\)", r"Cash on Delivery<br />({{ 'ln.LP_CashOnDelivery' | translate }})"),
    (r"অর্ডারটি নিশ্চিত করুন", r"{{ 'ln.LP_ConfirmOrder' | translate }}"),
    (r"অর্ডার সাবমিট হচ্ছে...", r"{{ 'ln.LP_OrderSubmitting' | translate }}"),
    (r"একটু পড়ে দেখুন", r"{{ 'ln.LP_ReadPreview' | translate }}")
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
