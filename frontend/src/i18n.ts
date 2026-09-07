import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      catalog: "Catalog",
      profile: "Profile",
      admin: "Admin Panel",
      language: "Language",
      theme: "Theme",
      dark_mode: "Dark Mode",
      light_mode: "Light Mode",
      share_contact: "Share Phone Number",
      no_products: "No products available.",
      price: "Price",
      add_category: "Add Category",
      add_product: "Add Product",
      name: "Name",
      description: "Description",
      base_price: "Base Price",
      save: "Save",
      visible: "Visible on Landing",
      phone_number: "Phone Number",
      lbl_days: "days",
      lbl_lifetime: "Lifetime",
      lbl_out_of_stock: "Out of Stock",
      btn_add_to_basket: "Add to Basket",
      tab_settings: "Settings",
      tab_inventory: "Inventory",
      lbl_support: "Support",
      tab_wallet: "Wallet",
      tab_payments: "Payments",
      tab_catalog: "Catalog",
      tab_messages: "Messages",
      tab_users: "Users",
      tab_invoices: "Invoices",
      manage_codes: "Manage Codes",
      bought_by: "Bought by",
      invoice_hash: "Invoice #",
      available: "Available",
      sold: "Sold",
      enter_code: "Enter code",
      add: "Add",
      delete: "Delete",
      no_codes_added_yet: "No codes added yet",
      toman: "Toman",
      usd: "USD",
      irr: "IRR",
      irt: "IRT",
      status_pending_payment: "Pending Payment",
      status_pending_approval: "Pending Approval",
      status_approved: "Approved",
      status_rejected: "Rejected"
    }
  },
  fa: {
    translation: {
      catalog: "کاتالوگ",
      profile: "پروفایل",
      admin: "پنل ادمین",
      language: "زبان",
      theme: "پوسته",
      dark_mode: "حالت تاریک",
      light_mode: "حالت روشن",
      share_contact: "اشتراک شماره تماس",
      no_products: "محصولی موجود نیست.",
      price: "قیمت",
      add_category: "افزودن دسته بندی",
      add_product: "افزودن محصول",
      name: "نام",
      description: "توضیحات",
      base_price: "قیمت پایه",
      save: "ذخیره",
      visible: "نمایش در صفحه اصلی",
      phone_number: "شماره تماس",
      lbl_days: "روز",
      lbl_lifetime: "دائمی",
      lbl_out_of_stock: "ناموجود",
      btn_add_to_basket: "افزودن به سبد",
      tab_settings: "تنظیمات",
      tab_inventory: "خریدها",
      lbl_support: "پشتیبانی",
      tab_wallet: "کیف پول",
      tab_payments: "پرداخت ها",
      tab_catalog: "کاتالوگ",
      tab_messages: "پیام ها",
      tab_users: "کاربران",
      tab_invoices: "فاکتورها",
      manage_codes: "مدیریت کدها",
      bought_by: "خریدار",
      invoice_hash: "فاکتور #",
      available: "موجود",
      sold: "فروخته شده",
      enter_code: "وارد کردن کد",
      add: "افزودن",
      delete: "حذف",
      no_codes_added_yet: "هنوز کدی اضافه نشده",
      toman: "تومان",
      usd: "دلار",
      irr: "ریال",
      irt: "تومان",
      status_pending_payment: "در انتظار پرداخت",
      status_pending_approval: "در انتظار تایید",
      status_approved: "تایید شده",
      status_rejected: "رد شده"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fa", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export const loadTranslations = async () => {
  try {
    const res = await fetch('/api/translations');
    if (res.ok) {
      const data = await res.json();
      if (data.translations) {
        for (const [lang, msgs] of Object.entries(data.translations)) {
          i18n.addResourceBundle(lang, 'translation', msgs, true, true);
        }
      }
    }
  } catch (e) {
    console.error("Failed to load dynamic translations", e);
  }
};

export default i18n;

export const formatNumber = (val: number | string | undefined | null) => {
  if (val === undefined || val === null) return '';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
};
